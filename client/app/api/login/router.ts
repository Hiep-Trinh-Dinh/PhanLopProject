import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    const backendResponse = await fetch('http://localhost:8080/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Cho phép gửi/nhận cookies
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Chuyển tiếp cookies từ backend đến client
    const cookies = backendResponse.headers.get('set-cookie');
    if (cookies) {
      return NextResponse.json(await backendResponse.json(), {
        headers: { 'set-cookie': cookies }
      });
    }

    return NextResponse.json(await backendResponse.json());
  } catch (error) {
    return NextResponse.json(
      { error: 'Connection error' },
      { status: 500 }
    );
  }
}