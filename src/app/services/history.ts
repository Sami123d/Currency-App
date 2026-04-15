import { Injectable, signal } from '@angular/core';

interface ConversionRecord {
  from: string;
  to: string;
  amount: number;
  result: number;
  date: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  history = signal<ConversionRecord[]>([]);

  constructor() {
    this.loadHistory();
  }

  addRecord(record: ConversionRecord) {
    this.history.update(h => [record, ...h]);
    localStorage.setItem('conversionHistory', JSON.stringify(this.history()));
  }

  private loadHistory() {
    const stored = localStorage.getItem('conversionHistory');
    if (stored) {
      this.history.set(JSON.parse(stored));
    }
  }
}
