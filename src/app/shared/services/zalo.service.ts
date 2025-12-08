import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZaloService {
  
  // 🔥 Dùng chung Proxy Cloudflare
  private readonly PROXY_HOST = 'https://cskh-phg.daoanh08091999.workers.dev/';
  
  // URL n8n gốc
  private readonly N8N_URL = 'https://go.n8n.app/webhook-test/cskh-phg-2';

  constructor(private http: HttpClient) { }

  sendMaintenanceData(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Ghép chuỗi: Proxy + URL n8n
    // Kết quả sẽ là: https://kiotviet-proxy.../https://go.n8n.app/...
    return this.http.post(this.PROXY_HOST + this.N8N_URL, data, { headers });
  }
}