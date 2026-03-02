import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    // Auth Check
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'test');
    
    const otherUserId = params.id;
    const myId = decoded.id;

    const messages = await Message.find({
        $or: [
            { sender: myId, receiver: otherUserId },
            { sender: otherUserId, receiver: myId }
        ]
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
