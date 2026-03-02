import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Swipe from '@/models/Swipe';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Auth Check
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'test');
    const currentUserId = decoded.id;

    // Logic
    const swipedUserIds = await Swipe.find({ fromUser: currentUserId }).distinct('toUser');

    const users = await User.find({
      _id: { $nin: [...swipedUserIds, currentUserId] }
    }).limit(20);

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
