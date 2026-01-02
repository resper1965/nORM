/**
 * Cron Job Authentication
 * Verifies requests from Vercel Cron or service role
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

/**
 * Verify cron job request
 * Checks for CRON_SECRET in Authorization header or Vercel Cron signature
 */
export function verifyCronRequest(request: NextRequest): boolean {
  // Check for CRON_SECRET in Authorization header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader) {
    const expectedHeader = `Bearer ${cronSecret}`;
    if (authHeader === expectedHeader) {
      return true;
    }
  }

  // Check for Vercel Cron signature (if available)
  const cronSignature = request.headers.get('x-vercel-cron-signature');
  if (cronSignature) {
    // Vercel automatically adds this header for cron jobs
    // In production, you might want to verify the signature
    return true;
  }

  // Check if request is from Vercel Cron (user-agent)
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent.includes('vercel-cron')) {
    return true;
  }

  // In development, allow if CRON_SECRET is not set (for testing)
  if (process.env.NODE_ENV === 'development' && !cronSecret) {
    logger.warn('Cron request allowed in development without CRON_SECRET');
    return true;
  }

  return false;
}

/**
 * Middleware to protect cron endpoints
 * Returns 401 if request is not authorized
 */
export function requireCronAuth(request: NextRequest): NextResponse | null {
  if (!verifyCronRequest(request)) {
    logger.warn('Unauthorized cron request', {
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid cron secret or signature' },
      { status: 401 }
    );
  }

  return null;
}
