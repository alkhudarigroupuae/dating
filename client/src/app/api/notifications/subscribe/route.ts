import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Auth Check
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'test');
    
    const subscription = await request.json();

    await User.findByIdAndUpdate(decoded.id, {
        pushSubscription: subscription
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
