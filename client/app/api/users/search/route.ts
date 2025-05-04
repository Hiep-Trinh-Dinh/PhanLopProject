import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Lấy query từ URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Thiếu từ khóa tìm kiếm' }, { status: 400 });
    }

    // Chuẩn hóa từ khóa tìm kiếm bằng cách loại bỏ khoảng trắng thừa
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return NextResponse.json(
        { error: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' }, 
        { status: 400 }
      );
    }

    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const cookies = request.headers.get('cookie');
    
    // Chuẩn bị headers cho request
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Thêm cookie nếu có
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Tạo URL tìm kiếm với tham số đầy đủ
    const timestamp = Date.now();
    const searchUrl = `${API_URL}/api/users/search?query=${encodeURIComponent(normalizedQuery)}&_t=${timestamp}&force=true`;
    
    // Log thông tin request để debug
    console.log(`[Search] Query: "${normalizedQuery}", URL: ${searchUrl}`);
    
    // Chuẩn bị headers với No-Cache
    headers = {
      ...headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Force-Refresh': 'true'
    };
    
    // Gọi API tìm kiếm với từ khóa đầy đủ
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    // Kiểm tra kết quả
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Search] Server responded with error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: errorText || 'Không thể tìm kiếm người dùng' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    const resultCount = data.content ? data.content.length : 0;
    console.log(`[Search] Found ${resultCount} results for query "${normalizedQuery}"`);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Lỗi tìm kiếm người dùng:', error);
    return NextResponse.json({ error: 'Lỗi server khi tìm kiếm' }, { status: 500 });
  }
} 