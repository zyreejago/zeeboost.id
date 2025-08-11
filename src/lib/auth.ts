import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function verifyAdminToken(request: NextRequest) {
  try {
    // Coba ambil token dari cookie dulu
    let token = request.cookies.get('admin-token')?.value;
    
    // Jika tidak ada di cookie, coba dari Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    return {
      success: true,
      admin: {
        id: decoded.adminId,
        username: decoded.username,
        role: decoded.role,
      },
    };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}