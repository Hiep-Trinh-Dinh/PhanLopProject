import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Lấy ID cuộc trò chuyện từ tham số URL
    const conversationId = params.id;
    
    console.log(`[Messages] Fetching all messages for conversation ${conversationId}`);
    
    // Lấy cookies từ request để truyền đến API backend
    const cookies = request.headers.get('cookie');
    
    // URL của backend API
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const apiUrl = `${API_URL}/api/messages/conversations/${conversationId}/messages/all`;
    
    console.log(`[Messages API] Calling backend URL: ${apiUrl}`);
    
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
    
    try {
      // Gọi API backend
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      // Kiểm tra response
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Messages API] Server responded with error: ${response.status} ${errorText}`);
        // Ghi thêm thông tin chi tiết về lỗi để debug
        console.error(`[Messages API] Request details: URL=${apiUrl}, Cookie=${cookies ? 'Present' : 'Missing'}`);
        return NextResponse.json({ error: `Error fetching messages: ${response.status}`, messages: [] }, { status: 200 });
      }
      
      // Lấy nội dung response và kiểm tra kiểu dữ liệu
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        console.warn(`[Messages API] Server returned empty response`);
        return NextResponse.json([], { status: 200 });
      }
      
      console.log(`[Messages API] Server response text length: ${responseText.length}`);
      console.log(`[Messages API] Server response preview: ${responseText.slice(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      
      let data;
      try {
        data = JSON.parse(responseText);
        
        // Kiểm tra kiểu dữ liệu 
        if (Array.isArray(data)) {
          console.log(`[Messages API] Received array of ${data.length} messages`);
          return NextResponse.json(data);
        } 
        
        // Xử lý trường hợp Spring Boot trả về Page object
        if (data && typeof data === 'object') {
          console.log(`[Messages API] Received object response`);
          
          // Kiểm tra các trường hợp dữ liệu có thể có (Spring Boot Page, custom object, etc)
          if (Array.isArray(data.content)) {
            console.log(`[Messages API] Found array in data.content with ${data.content.length} items`);
            return NextResponse.json(data.content);
          }
          
          // Trường hợp khác - log để debug
          console.warn(`[Messages API] Response is not array or pageable: ${JSON.stringify(data).slice(0, 200)}`);
        }
        
        // Trường hợp không xác định được kiểu dữ liệu
        console.warn(`[Messages API] Could not determine data type, returning empty array`);
        return NextResponse.json([], { status: 200 });
        
      } catch (parseError) {
        console.error(`[Messages API] Error parsing JSON: ${parseError}`);
        console.error(`[Messages API] Response text that failed to parse: ${responseText.slice(0, 500)}`);
        return NextResponse.json({ error: 'Invalid JSON response', messages: [] }, { status: 200 });
      }
    } catch (fetchError) {
      console.error(`[Messages API] Fetch error: ${fetchError}`);
      return NextResponse.json({ error: 'Network error', messages: [] }, { status: 200 });
    }
  } catch (error) {
    console.error(`[Messages API] Unexpected error: ${error}`);
    return NextResponse.json({ error: 'Unexpected error', messages: [] }, { status: 200 });
  }
} 