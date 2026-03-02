import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Match from '@/models/Match';
import User from '@/models/User'; // Ensure User model is registered
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
    
    const matches = await Match.find({
        users: { $in: [decoded.id] },
        status: 'matched'
    }).populate('users', 'name photos');

    const formattedMatches = matches.map(match => {
        const otherUser = (match.users as any).find((u: any) => u._id.toString() !== decoded.id);
        return {
            id: match._id,
            user: otherUser,
            createdAt: match.createdAt
        };
    });

    return NextResponse.json(formattedMatches);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
