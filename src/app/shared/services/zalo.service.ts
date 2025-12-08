import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZaloService {
  // URL API từ Smax bạn cung cấp
  private readonly API_URL = 'https://api.smax.ai/public/bizs/vananhdao/triggers/69361b5cf368ebebf4e863f8';
  
  // Access Token từ URL của bạn
  private readonly ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cmlnZ2VyX2lkIjoiNjkzNjFiNWNmMzY4ZWJlYmY0ZTg2M2Y4IiwiaWF0IjoxNzY1MTUzNjI4LCJleHAiOjMxNzMwOTU5NjAyOH0.mVY3QfY-kZPNCSLAPAjqLWO46hG_5np8qMKcrRk9mss';
  
  // ID của Zalo OA (Lấy từ URL Smax trong ảnh bạn gửi: zlw2126797563748572346)
  private readonly PAGE_ID = 'zlw2126797563748572346'; 

  constructor(private http: HttpClient) { }

  /**
   * Gửi tin nhắn nhắc bảo trì qua Smax
   * @param zaloUserId ID người dùng trên Zalo (Lấy từ hệ thống Smax/Zalo)
   * @param data Dữ liệu cần điền vào tin nhắn (Tên khách, tên lõi, ngày...)
   */
  sendMaintenanceReminder(zaloUserId: string, data: { customerName: string; coreName: string; dueDate: string }): Observable<any> {
    
    // 1. Cấu trúc tham số 'customer'
    const customerPayload = JSON.stringify({
      id: zaloUserId, 
      page_id: this.PAGE_ID
    });

    // 2. Cấu trúc tham số 'attrs' (Các biến sẽ dùng trong kịch bản Smax)
    // Bạn cần tạo các biến này trong Flow của Smax (ví dụ: {{ten_khach}}, {{ten_loi}})
    const attrsPayload = JSON.stringify([
      { name: 'ten_khach', value: data.customerName },
      { name: 'ten_loi', value: data.coreName },
      { name: 'ngay_het_han', value: data.dueDate }
    ]);

    // 3. Tạo Query Params
    const params = new HttpParams()
      .set('access_token', this.ACCESS_TOKEN)
      .set('customer', customerPayload)
      .set('attrs', attrsPayload);

    // 4. Gọi API (Smax Trigger hỗ trợ GET)
    return this.http.get(this.API_URL, { params });
  }
}