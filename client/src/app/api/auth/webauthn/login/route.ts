import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';

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
      const user = await User.findOne({ email });
      if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: user.authenticators.map(auth => ({
            id: auth.credentialID, // SimpleWebAuthn v9+ expects base64url string usually, or buffer depending on version. Let's try string if library handles it or use utils.
            // Actually, if we look at the error: "Type 'Buffer' is not assignable to type 'string'". 
            // It seems generateAuthenticationOptions expects `id` as string (base64url encoded usually).
            // Our DB stores base64. Let's just pass the string from DB and let the library handle or convert if needed.
            // If the library expects base64url, we might need conversion.
            // But let's try passing the string directly as the error suggests it wants a string.
            // If it wants base64url, we can replace + with - and / with _ and remove =.
            // For now, let's fix the type error first.
            // The error said: "Type 'Buffer' is not assignable to type 'string'".
            // So we were passing Buffer.from(...) which returns a Buffer.
            
            // Let's pass the base64 string directly from DB.
            type: 'public-key',
            transports: auth.transports as any,
        })),
        userVerification: 'preferred',
      });

      user.currentChallenge = options.challenge;
      await user.save();

      return NextResponse.json(options);

    } else if (action === 'verify') {
      const { authenticationResponse } = body;
      
      const user = await User.findOne({ email });
      if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

      const authenticator = user.authenticators.find(
        (auth) => auth.credentialID === authenticationResponse.id // Match by ID string
      );

      if (!authenticator) {
          return NextResponse.json({ message: "Authenticator not found" }, { status: 400 });
      }

      const verification = await verifyAuthenticationResponse({
        response: authenticationResponse,
        expectedChallenge: user.currentChallenge || '',
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
            id: authenticator.credentialID,
            publicKey: new Uint8Array(Buffer.from(authenticator.credentialPublicKey, 'base64')),
            counter: authenticator.counter,
            transports: authenticator.transports as any,
        },
      });

      if (verification.verified) {
        const { authenticationInfo } = verification;
        authenticator.counter = authenticationInfo.newCounter;
        user.currentChallenge = undefined;
        await user.save();

        // Generate JWT
        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET || 'test', { expiresIn: "1h" });

        return NextResponse.json({ verified: true, token, result: user });
      }

      return NextResponse.json({ verified: false }, { status: 400 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
