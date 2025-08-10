import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function verifyAdminToken(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
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