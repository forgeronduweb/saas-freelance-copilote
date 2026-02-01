import { jwtVerify } from 'jose';

export interface JWTPayload {
  userId: string;
  email: string;
  userType: 'freelance' | 'client';
}

const JWT_SECRET = process.env.JWT_SECRET || 'build-time-placeholder-secret-minimum-32-characters-long';

/**
 * Vérifie un token JWT - Compatible Edge Runtime
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      userType: payload.userType as 'freelance' | 'client',
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
