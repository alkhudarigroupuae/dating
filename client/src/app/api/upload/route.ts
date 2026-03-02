import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
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
    
    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'test');
    } catch (err) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    
    const userId = decoded.id;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename || !request.body) {
        return NextResponse.json({ message: "Filename or body missing" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    // Update User in DB
    const user = await User.findById(userId);
    if (user) {
        if (!user.photos) user.photos = [];
        user.photos.unshift(blob.url);
        await user.save();
    }

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Upload failed: " + error.message }, { status: 500 });
  }
}
