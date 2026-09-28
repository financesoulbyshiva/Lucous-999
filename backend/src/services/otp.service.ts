import prisma from "../config/prisma";
import env from "../config/env";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function isDev(): boolean {
  return env.isDevelopment;
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issueOtp(
  email: string,
  purpose: "VERIFY" | "RESET",
  userId?: string | null
): Promise<string> {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Invalidate any previous unused OTPs for this email + purpose.
  await prisma.otp.deleteMany({
    where: { email, purpose, verified: false },
  });

  await prisma.otp.create({
    data: {
      email,
      code,
      purpose,
      expiresAt,
      userId: userId ?? null,
    },
  });

  console.log(`[OTP] ${purpose} code for ${email}: ${code} (expires ${expiresAt.toISOString()})`);
  return code;
}
