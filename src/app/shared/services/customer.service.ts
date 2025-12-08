import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KiotVietService {
  // Cấu hình
  private tokenUrl = '/connect/token';
  private apiUrl = '/api';
  private clientId = '2e99e1b4-5604-40ae-a254-cb2640e81135';
  private clientSecret = '04C9131537234B6B37E6B36AE2DCB8DA5D0082CB';
  private retailer = 'phanhoanggia';
  
  // Khóa để lưu trong localStorage
  private STORAGE_KEY = 'kiotviet_session';

  constructor(private http: HttpClient) { }

  // --- PHẦN 1: QUẢN LÝ TOKEN (Logic cốt lõi) ---

  /**
   * Hàm này sẽ trả về một Observable chứa Access Token hợp lệ.
   * Nó tự động kiểm tra LocalStorage, nếu còn hạn thì dùng lại,
   * nếu hết hạn thì tự đi lấy cái mới.
   */
  public getValidToken(): Observable<string> {
    const session = this.getSession();

    // Kiểm tra xem có token và còn hạn sử dụng không (trừ hao 10 giây cho chắc chắn)
    const now = Date.now();
    if (session && session.accessToken && session.expiresAt > (now + 10000)) {
      // //console.log('✅ Dùng lại Token từ bộ nhớ (Cache)');
      return of(session.accessToken);
    }

    // Nếu không có hoặc hết hạn -> Gọi API lấy mới
    // //console.log('🔄 Token hết hạn hoặc không có -> Đang lấy mới...');
    return this.requestNewToken();
  }

  // Gọi API thực tế để lấy token
  private requestNewToken(): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams()
      .set('scopes', 'PublicApi.Access')
      .set('grant_type', 'client_credentials')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret);

    return this.http.post<any>(this.tokenUrl, body.toString(), { headers }).pipe(
      // Sau khi lấy được, lưu ngay vào LocalStorage
      tap(res => this.saveSession(res)),
      // Chỉ trả về chuỗi access_token cho bước sau dùng
      map(res => res.access_token)
    );
  }

  // Lưu token và tính toán thời gian hết hạn
  private saveSession(apiResponse: any) {
    const expiresAt = Date.now() + (apiResponse.expires_in * 1000); // Đổi giây ra mili-giây
    const data = {
      accessToken: apiResponse.access_token,
      expiresAt: expiresAt
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // Lấy dữ liệu từ LocalStorage
  private getSession(): any {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // --- PHẦN 2: CÁC API DỮ LIỆU (Đã được nâng cấp) ---
  
  // Helper tạo Header
  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Retailer': this.retailer,
      'Authorization': `Bearer ${token}`
    });
  }

  // Lấy Hóa đơn (Tự động xử lý Token)
  getInvoices(limit: number = 20): Observable<any> {
    // Dùng switchMap: Trước tiên lấy Token hợp lệ -> Sau đó mới gọi API Hóa đơn
    return this.getValidToken().pipe(
      switchMap(token => {
        const headers = this.getHeaders(token);
        const params = new HttpParams().set('pageSize', limit);
        return this.http.get(`${this.apiUrl}/invoices`, { headers, params });
      })
    );
  }

  // Lấy Users
  getUsers(): Observable<any> {
    return this.getValidToken().pipe(
      switchMap(token => {
        const headers = this.getHeaders(token);
        return this.http.get(`${this.apiUrl}/users`, { headers });
      })
    );
  }

  // Lấy Orders
  getOrders(limit: number = 20): Observable<any> {
    return this.getValidToken().pipe(
      switchMap(token => {
        const headers = this.getHeaders(token);
        const params = new HttpParams().set('pageSize', limit);
        return this.http.get(`${this.apiUrl}/orders`, { headers, params });
      })
    );
  }
  
  // Lấy Customers
  getCustomers(limit: number = 20): Observable<any> {
    return this.getValidToken().pipe(
      switchMap(token => {
        const headers = this.getHeaders(token);
        const params = new HttpParams().set('pageSize', limit);
        return this.http.get(`${this.apiUrl}/customers`, { headers, params });
      })
    );
  }
}

export interface Customer {
  id: number;
  code: string;           // Mã khách hàng (VD: KH000001)
  name: string;           // Tên khách hàng
  contactNumber: string;  // Số điện thoại
  address: string;        // Địa chỉ
  locationName: string;   // Tên khu vực (VD: Hồ Chí Minh - Quận 1)
  wardName: string;       // Tên phường/xã
  email: string;
  organization: string;   // Tên công ty/tổ chức (nếu có)
  
  branchId: number;       // ID chi nhánh quản lý
  retailerId: number;     // ID gian hàng
  debt: number;           // Dư nợ hiện tại
  type: number;           // Loại khách: thường là 0 (Cá nhân) hoặc 1 (Công ty)
  
  createdDate: string;    // Ngày tạo (dạng chuỗi ISO)
  modifiedDate: string;   // Ngày sửa đổi cuối
}