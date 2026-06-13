import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Find the token in the DB
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > resetToken.expires) {
      // Delete the expired token
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json({ message: 'Token has expired' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete the token
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: 'Password successfully reset' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
