import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Lấy ID cuộc trò chuyện từ tham số URL
    const conversationId = params.id;
    
    // Lấy cookies từ request
    const cookies = request.headers.get('cookie');
    
    // URL của backend API
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const apiUrl = `${API_URL}/api/messages/conversations/${conversationId}`;
    
    console.log(`[Conversation] Fetching conversation ${conversationId} from: ${apiUrl}`);
    
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
      console.error(`[Conversation] Server responded with error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: errorText || 'Không thể lấy thông tin cuộc trò chuyện' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Lỗi khi lấy thông tin cuộc trò chuyện:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy thông tin cuộc trò chuyện' }, 
      { status: 500 }
    );
  }
} 