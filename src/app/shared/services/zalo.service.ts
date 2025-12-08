import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZaloService {
  // Tiền tố Proxy
  private readonly CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  
  // URL n8n
  private readonly N8N_URL = 'https://go.n8n.app/webhook-test/cskh-phg-2';

  constructor(private http: HttpClient) { }

  sendMaintenanceData(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Ghép Proxy + URL n8n
    return this.http.post(this.CORS_PROXY + this.N8N_URL, data, { headers });
  }
}