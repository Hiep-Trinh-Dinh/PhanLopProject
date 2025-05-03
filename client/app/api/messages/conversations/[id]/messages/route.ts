import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Lấy ID cuộc trò chuyện từ tham số URL
    const conversationId = params.id;
    
    // Lấy query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';
    
    // Lấy cookies từ request
    const cookies = request.headers.get('cookie');
    
    // URL của backend API
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const apiUrl = `${API_URL}/api/messages/conversations/${conversationId}/messages?page=${page}&size=${size}`;
    
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
      console.error(`Server responded with error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: errorText || 'Không thể lấy tin nhắn' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Lỗi khi lấy tin nhắn:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy tin nhắn' }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Lấy ID cuộc trò chuyện từ tham số URL
    const conversationId = params.id;
    
    // Lấy cookies và dữ liệu từ request
    const cookies = request.headers.get('cookie');
    const messageData = await request.json();
    
    console.log(`[Messages] Sending message to conversation ${conversationId}`);
    
    // URL của backend API
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const apiUrl = `${API_URL}/api/messages/conversations/${conversationId}/messages`;
    
    // Chuẩn bị headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Gọi API backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(messageData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Messages] Server responded with error when sending message: ${response.status} ${errorText}`);
      throw new Error(`Failed to send message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[Messages] Message sent successfully to conversation ${conversationId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi gửi tin nhắn' }, 
      { status: 500 }
    );
  }
} 