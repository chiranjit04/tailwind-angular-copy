import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KiotVietService {

  // Cấu hình Proxy
  private tokenUrl = '/connect/token'; 
  private apiUrl = '/api'; // Proxy trỏ đến public.kiotapi.com

  // Thông tin cấu hình
  private clientId = '2e99e1b4-5604-40ae-a254-cb2640e81135';
  private clientSecret = '04C9131537234B6B37E6B36AE2DCB8DA5D0082CB';
  private retailer = 'phanhoanggia'; 

  constructor(private http: HttpClient) { }

  // --- HELPER: Hàm tạo Header dùng chung ---
  private getHeaders(accessToken: string): HttpHeaders {
    return new HttpHeaders({
      'Retailer': this.retailer,
      'Authorization': `Bearer ${accessToken}`
    });
  }

  // --- 1. Xác thực (Lấy Token) ---
  getAccessToken(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams()
      .set('scopes', 'PublicApi.Access')
      .set('grant_type', 'client_credentials')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret);
    return this.http.post(this.tokenUrl, body.toString(), { headers });
  }

  // --- 2. Khách hàng (Customers) ---
  getCustomers(accessToken: string, limit: number = 20): Observable<any> {
    const headers = this.getHeaders(accessToken);
    const params = new HttpParams().set('pageSize', limit);
    return this.http.get(`${this.apiUrl}/customers`, { headers, params });
  }

  // --- 3. Hóa đơn (Invoices) ---
  // API: https://public.kiotapi.com/invoices
  getInvoices(accessToken: string, limit: number = 20): Observable<any> {
    const headers = this.getHeaders(accessToken);
    // Bạn có thể thêm các tham số lọc khác như fromDate, toDate vào đây
    const params = new HttpParams().set('pageSize', limit);
    return this.http.get(`${this.apiUrl}/invoices`, { headers, params });
  }

  // --- 4. Người dùng/Nhân viên (Users) ---
  // API: https://public.kiotapi.com/users
  getUsers(accessToken: string): Observable<any> {
    const headers = this.getHeaders(accessToken);
    return this.http.get(`${this.apiUrl}/users`, { headers });
  }

  // --- 5. Đơn đặt hàng (Orders) ---
  // API: https://public.kiotapi.com/orders
  getOrders(accessToken: string, limit: number = 20): Observable<any> {
    const headers = this.getHeaders(accessToken);
    const params = new HttpParams().set('pageSize', limit);
    return this.http.get(`${this.apiUrl}/orders`, { headers, params });
  }
}