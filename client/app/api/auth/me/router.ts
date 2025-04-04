import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const backendResponse = await fetch('http://localhost:8080/api/auth/me', {
      method: 'GET',
      credentials: 'include' // Gửi cookie tự động
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
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}