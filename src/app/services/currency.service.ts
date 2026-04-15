// currency.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCurrencies() {
    return this.http.get(`${this.API}/currencies`);
  }

  getLatest(base: string) {
    return this.http.get(`${this.API}/latest?base=${base}`);
  }

  getHistorical(base: string, date: string) {
    return this.http.get(
      `${this.API}/historical?base=${base}&date=${date}`
    );
  }
}