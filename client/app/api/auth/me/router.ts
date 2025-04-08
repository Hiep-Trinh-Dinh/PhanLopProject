import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const API_URL = process.env.BACKEND_API_URL

    const backendResponse = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include', // đảm bảo gửi cookie nếu dùng trong browser env
    })

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userData = await backendResponse.json()
    return NextResponse.json(userData)
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
