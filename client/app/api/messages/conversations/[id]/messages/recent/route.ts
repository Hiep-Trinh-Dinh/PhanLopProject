import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Lấy ID cuộc trò chuyện từ tham số URL
    const conversationId = params.id;
    
    // Lấy lastMessageId từ query parameters
    const { searchParams } = new URL(request.url);
    const lastMessageId = searchParams.get('lastMessageId') || '0';
    
    console.log(`[Messages] Fetching recent messages for conversation ${conversationId}, after messageId ${lastMessageId}`);
    
    // Lấy cookies từ request để truyền đến API backend
    const cookies = request.headers.get('cookie');
    
    // URL của backend API
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const apiUrl = `${API_URL}/api/messages/conversations/${conversationId}/messages/recent?lastMessageId=${lastMessageId}`;
    
    // Chuẩn bị headers cho request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
    
    // Thêm cookie nếu có
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Gọi API backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    // Kiểm tra response
    if (!response.ok) {
      console.error(`[Messages] Server responded with error: ${response.status}`);
      return NextResponse.json([], { status: 200 }); // Trả về mảng rỗng với status 200
    }
    
    // Trả về dữ liệu tin nhắn mới
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi lấy tin nhắn mới:', error);
    return NextResponse.json([], { status: 200 }); // Trả về mảng rỗng với status 200
  }
} 