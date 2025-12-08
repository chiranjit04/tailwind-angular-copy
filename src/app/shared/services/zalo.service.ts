import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZaloService {
  // URL Proxy trỏ đến n8n
  // URL gốc: https://go.n8n.app/webhook-test/cskh-phg-2
  // URL qua Proxy: /n8n/webhook-test/cskh-phg-2
  private readonly N8N_API_URL = '/n8n/webhook/cskh-phg-2';

  constructor(private http: HttpClient) { }

  /**
   * Gửi dữ liệu bảo trì sang n8n để xử lý (Gửi Zalo/Email...)
   * @param data : Object chứa thông tin khách hàng và lịch bảo trì
   */
  sendMaintenanceData(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Gửi POST request với body là dữ liệu JSON
    return this.http.post(this.N8N_API_URL, data, { headers });
  }
}