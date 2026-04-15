import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyService } from '../../services/currency.service';
import { HistoryService } from '../../services/history';
import { CommonModule } from '@angular/common';

interface Currency {
  code: string;
  name: string;
}

interface ConversionRecord {
  from: string;
  to: string;
  amount: number;
  result: number;
  date: string;
  timestamp: Date;
}

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    CommonModule,
  ],
  templateUrl: './converter.html',
  styleUrl: './converter.css',
})
export class Converter implements OnInit {
  currencies = signal<Currency[]>([]);
  form: FormGroup;
  result = signal<number | null>(null);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private currencyService: CurrencyService,
    private historyService: HistoryService
  ) {
    this.form = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      amount: [1, [Validators.required, Validators.min(0.01)]],
      date: [new Date()],
    });
  }

  ngOnInit() {
    this.loadCurrencies();
  }

  loadCurrencies() {
    this.currencyService.getCurrencies().subscribe({
      next: (data: any) => {
        const currs = Object.keys(data.data).map(code => ({
          code,
          name: data.data[code].name,
        }));
        this.currencies.set(currs);
      },
      error: (err) => console.error(err),
    });
  }

  private formatLocalDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  convert() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { from, to, amount, date } = this.form.value;
    const dateStr = this.formatLocalDate(date);
    const todayStr = this.formatLocalDate(new Date());
    const apiCall = dateStr === todayStr
      ? this.currencyService.getLatest(from)
      : this.currencyService.getHistorical(from, dateStr);

    apiCall.subscribe({
      next: (data: any) => {
        let rate;
        if (dateStr === todayStr) {
          // Latest data: data.data["INR"]
          rate = data.data[to];
        } else {
          // Historical data: data.data["2026-04-08"]["INR"]
          rate = data.data[dateStr][to];
        }
        const res = amount * rate;
        this.result.set(res);
        this.historyService.addRecord({
          from,
          to,
          amount,
          result: res,
          date: dateStr,
          timestamp: new Date(),
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }
}
