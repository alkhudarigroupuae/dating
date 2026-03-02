import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Match from '@/models/Match';
import Swipe from '@/models/Swipe';
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
    const fromUser = decoded.id;

    const { toUser, type } = await request.json();

    // Create Swipe
    await Swipe.create({ fromUser, toUser, type });

    if (type === 'nope') {
        return NextResponse.json({ match: false });
    }

    // Check match
    const reverseSwipe = await Swipe.findOne({
        fromUser: toUser,
        toUser: fromUser,
        type: { $in: ['like', 'superlike'] }
    });

    if (reverseSwipe) {
        const match = await Match.create({
            users: [fromUser, toUser],
            status: 'matched'
        });

        // Notify BOTH users
        const fromUserData = await User.findById(fromUser);
        const toUserData = await User.findById(toUser);

        if (toUserData && toUserData.pushSubscription) {
             await sendNotification(toUserData.pushSubscription, {
                title: "It's a Match! 🎉",
                body: `You and ${fromUserData?.name} liked each other!`,
                url: `/messages/${fromUser}`
            });
        }
        
        if (fromUserData && fromUserData.pushSubscription) {
            await sendNotification(fromUserData.pushSubscription, {
               title: "It's a Match! 🎉",
               body: `You and ${toUserData?.name} liked each other!`,
               url: `/messages/${toUser}`
           });
       }

        return NextResponse.json({ match: true, matchId: match._id });
    }

    return NextResponse.json({ match: false });

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
