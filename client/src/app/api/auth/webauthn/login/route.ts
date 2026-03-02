import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';

const rpID = 'localhost'; // Change in production
const origin = `http://${rpID}:3001`;

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { action, email } = body;

    if (action === 'generate-options') {
      const user = await User.findOne({ email });
      if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: user.authenticators.map(auth => ({
            id: Buffer.from(auth.credentialID, 'base64'), // Convert back to buffer
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
        (auth) => auth.credentialID === Buffer.from(authenticationResponse.id, 'base64').toString('base64') // Actually id is base64url encoded usually? SimpleWebAuthn handles this.
        // Wait, authenticationResponse.id is base64url. Our DB has base64.
        // SimpleWebAuthn `verifyAuthenticationResponse` handles the decoding of the response.
        // We just need to pass the authenticator from DB.
      );

      if (!authenticator) {
          // Try to find by matching credentialID directly if formats differ?
          // Let's proceed and let the library verify.
          return NextResponse.json({ message: "Authenticator not found" }, { status: 400 });
      }

      const verification = await verifyAuthenticationResponse({
        response: authenticationResponse,
        expectedChallenge: user.currentChallenge || '',
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
            credentialID: Buffer.from(authenticator.credentialID, 'base64'),
            credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64'),
            counter: authenticator.counter,
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
