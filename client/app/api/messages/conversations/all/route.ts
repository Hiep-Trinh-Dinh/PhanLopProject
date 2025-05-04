import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Lấy cookies từ request
    const cookies = request.headers.get('cookie');
    
    // URL của backend API
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const apiUrl = `${API_URL}/api/messages/conversations/all`;
    
    console.log(`[Conversations] Fetching all conversations from: ${apiUrl}`);
    
    // Chuẩn bị headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Gọi API backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Conversations] Server responded with error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: errorText || 'Không thể lấy danh sách cuộc trò chuyện' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách cuộc trò chuyện:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy danh sách cuộc trò chuyện' }, 
      { status: 500 }
    );
  }
} 