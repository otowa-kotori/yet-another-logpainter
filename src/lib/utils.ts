/**
 * 将Date对象转换为指定格式的时间字符串
 * @param date Date对象
 * @param format 格式类型：'full' | 'short' | 'log'
 * @returns 格式化后的时间字符串
 * 
 * @example
 * formatTime(new Date(), 'full')  // => "2024-02-22 20:45:24"
 * formatTime(new Date(), 'short') // => "20:45:24"
 * formatTime(new Date(), 'log')   // => "2024/02/22 20:45:24"
 */
export function formatTime(date: Date, format: 'full' | 'short' | 'log' = 'full'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    switch (format) {
        case 'short':
            return `${hours}:${minutes}:${seconds}`;
        case 'log':
            return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
        case 'full':
        default:
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
} 