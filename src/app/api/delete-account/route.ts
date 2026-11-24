import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, reason } = await req.json();

    if (!email || !phone) {
      return NextResponse.json(
        { status: false, message: 'Email and phone number are required.' },
        { status: 400 }
      );
    }

    // Save deletion request to Firestore for admin review and processing
    if (db) {
      await addDoc(collection(db, 'account_deletion_requests'), {
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        reason: reason || 'Not specified',
        status: 'pending',
        app: 'DataAbeg - Cheap Data & Bills',
        developer: 'Bimex Group',
        createdAt: serverTimestamp(),
      });
    }

    return NextResponse.json({
      status: true,
      message: 'Your account deletion request has been received. Your personal data and profile will be processed for deletion within 48 to 72 hours.',
    });
  } catch (error: any) {
    console.error('Account deletion request error:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to submit request. Please contact support at belloimam431@gmail.com.' },
      { status: 500 }
    );
  }
}

