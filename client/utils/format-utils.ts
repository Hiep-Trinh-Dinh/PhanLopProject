/**
 * Format-utils - Các hàm định dạng ngày tháng, số, v.v.
 */

/**
 * Format Date - Chuyển đổi chuỗi ngày giờ thành định dạng ngày dd/mm/yyyy
 * @param dateString Chuỗi ngày giờ
 * @returns Chuỗi ngày đã được định dạng dd/mm/yyyy
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Lỗi khi format ngày tháng:', error);
    return 'N/A';
  }
}

/**
 * Format DateTime - Chuyển đổi chuỗi ngày giờ thành định dạng đầy đủ dd/mm/yyyy HH:MM
 * @param dateString Chuỗi ngày giờ
 * @returns Chuỗi ngày giờ đã được định dạng dd/mm/yyyy HH:MM
 */
export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Lỗi khi format ngày tháng giờ:', error);
    return 'N/A';
  }
}

/**
 * Format TimeAgo - Chuyển đổi chuỗi ngày giờ thành định dạng "X phút trước", "X giờ trước", v.v.
 * @param dateString Chuỗi ngày giờ
 * @returns Chuỗi thời gian đã trôi qua
 */
export function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Vừa xong';
    } else if (diffMin < 60) {
      return `${diffMin} phút trước`;
    } else if (diffHour < 24) {
      return `${diffHour} giờ trước`;
    } else if (diffDay < 30) {
      return `${diffDay} ngày trước`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    console.error('Lỗi khi format timeago:', error);
    return 'N/A';
  }
} 