import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
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
    
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
