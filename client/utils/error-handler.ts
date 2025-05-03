// Định nghĩa interface mở rộng cho window
declare global {
  interface Window {
    __TOAST_DISABLED__?: boolean;
  }
}

/**
 * Hàm này ghi đè lên console.error để chặn thông báo lỗi tự động
 * trên giao diện người dùng khi có lỗi trong console
 */
export function disableConsoleErrorNotifications() {
  // Lưu lại hàm console.error gốc
  const originalConsoleError = console.error;

  // Ghi đè lên hàm console.error
  console.error = (...args: any[]) => {
    // Vẫn ghi log lỗi vào console để phục vụ debug
    // nhưng không hiển thị thông báo lỗi trên giao diện
    originalConsoleError(...args);
  };

  // Tùy chọn: Cũng có thể chặn console.warn
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    originalConsoleWarn(...args);
  };

  console.log("Đã tắt thông báo lỗi tự động từ console");

  // Thêm hook để chặn các thông báo toast từ lỗi
  if (typeof window !== 'undefined') {
    try {
      // Lưu trữ một biến toàn cục để chỉ ra trạng thái tắt toast
      window.__TOAST_DISABLED__ = true;
      
      // Nếu có toast từ react-hot-toast, ghi đè lên các phương thức của nó
      // Lưu ý: Điều này chỉ hoạt động nếu toast được import sau đó
      // Nếu không thành công, chúng ta vẫn có thể chặn thông qua console.error
      const importToast = () => {
        try {
          const toast = require('react-hot-toast');
          if (toast) {
            // Lưu các hàm gốc
            const originalError = toast.error;
            // Ghi đè toast.error
            toast.error = (...args: any[]) => {
              // Không làm gì cả, chỉ là hàm rỗng
              return args[0]; // Trả về id của toast để không gây lỗi
            };
            console.log("Đã vô hiệu hóa toast.error");
          }
        } catch (e) {
          // Không làm gì nếu không thể import toast
        }
      };
      
      // Thử import toast
      importToast();
    } catch (e) {
      // Không làm gì nếu có lỗi
    }
  }
}

/**
 * Khôi phục lại các hàm console gốc
 */
export function restoreConsoleErrorNotifications() {
  if (typeof window !== 'undefined') {
    console.error = window.console.error;
    console.warn = window.console.warn;
    
    // Bỏ cờ vô hiệu hóa toast
    window.__TOAST_DISABLED__ = false;
    
    console.log("Đã khôi phục thông báo lỗi tự động từ console");
  }
} 