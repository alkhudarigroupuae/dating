import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { sendNotification } from '@/lib/webpush';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Auth Check
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'test');
    
    const { receiverId, content, type } = await request.json();

    const newMessage = await Message.create({
        sender: decoded.id,
        receiver: receiverId,
        content,
        type: type || 'text'
    });

    // Send Notification to Receiver
    const receiver = await User.findById(receiverId);
    if (receiver && receiver.pushSubscription) {
        const sender = await User.findById(decoded.id);
        await sendNotification(receiver.pushSubscription, {
            title: `New message from ${sender?.name}`,
            body: content,
            url: `/messages/${decoded.id}`
        });
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
