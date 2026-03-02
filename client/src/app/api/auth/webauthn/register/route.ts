import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

const rpName = 'LoveConnect';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Dynamic RP ID and Origin for Vercel support
    const host = request.headers.get('host') || 'localhost:3001';
    const rpID = host.split(':')[0]; // Remove port if present
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    const body = await request.json();
    const { action, email } = body;

    if (action === 'generate-options') {
      // 1. Generate Registration Options
      // Check if user exists, if so, we can't register same email again for now (simplification)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return NextResponse.json({ message: "User already exists" }, { status: 400 });
      }

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: email, // Using email as user ID for simplicity
        userName: email,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
        },
      });

      // Ideally, store challenge in a temporary cache/session. 
      // For simplicity, we create a temporary user document or update it later.
      // But we can't save user yet because we don't have other details.
      // Let's store challenge in a "PendingRegistration" collection or just return it and trust the client (Not secure for production but okay for demo).
      // BETTER: Create the user now with empty authenticators and save challenge.
      
      // We need the other details (name, age, etc) to create the user first? 
      // Let's assume the client sends all details in the verify step OR we create a partial user now.
      
      // Let's create the user document now with the challenge.
      const { name, age, gender } = body;
      const newUser = await User.create({
          email,
          name,
          age,
          gender,
          currentChallenge: options.challenge,
          authenticators: []
      });

      return NextResponse.json(options);

    } else if (action === 'verify') {
      // 2. Verify Registration
      const { attestationResponse } = body;
      
      const user = await User.findOne({ email });
      if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

      const verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge: user.currentChallenge || '',
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo;
        const { id, publicKey, counter } = credential;
        
        user.authenticators.push({
            credentialID: id,
            credentialPublicKey: Buffer.from(publicKey).toString('base64'),
            counter,
        });
        user.currentChallenge = undefined; // Clear challenge
        await user.save();

        return NextResponse.json({ verified: true });
      }
      
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
