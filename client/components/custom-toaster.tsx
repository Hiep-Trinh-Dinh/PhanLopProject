"use client";

import { Toaster as HotToaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Định nghĩa interface mở rộng cho window
declare global {
  interface Window {
    __TOAST_DISABLED__?: boolean;
  }
}

export default function CustomToaster() {
  // State để theo dõi liệu toasts có bị vô hiệu hóa hay không
  const [disabled, setDisabled] = useState(false);
  
  useEffect(() => {
    // Kiểm tra nếu đã vô hiệu hóa toast
    if (typeof window !== 'undefined' && window.__TOAST_DISABLED__) {
      setDisabled(true);
    }
    
    // Lắng nghe sự thay đổi của cờ toasts
    const checkDisabled = () => {
      if (typeof window !== 'undefined' && window.__TOAST_DISABLED__) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    };
    
    // Kiểm tra mỗi giây để phát hiện thay đổi
    const interval = setInterval(checkDisabled, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Không render nếu bị vô hiệu hóa
  if (disabled) {
    return null;
  }
  
  // Render Toaster chỉ khi không bị vô hiệu hóa
  return <HotToaster position="top-right" />;
} 