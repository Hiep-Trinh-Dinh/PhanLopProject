import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const backendResponse = await fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    // Chuyển tiếp cookie xóa từ backend
    const cookies = backendResponse.headers.get('set-cookie');
    
    return NextResponse.json(
      { success: true },
      cookies ? { headers: { 'set-cookie': cookies } } : {}
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}