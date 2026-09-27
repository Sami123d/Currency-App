import { TestBed } from '@angular/core/testing';

import { HistoryService } from './history';

describe('HistoryService', () => {
  const record = {
    from: 'USD',
    to: 'EUR',
    amount: 100,
    result: 87.79,
    date: '2026-09-27',
    timestamp: new Date('2026-09-27T10:00:00Z'),
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts empty when nothing is stored', () => {
    const service = TestBed.inject(HistoryService);
    expect(service.history()).toEqual([]);
  });

  it('prepends new records and persists them to localStorage', () => {
    const service = TestBed.inject(HistoryService);
    service.addRecord(record);
    service.addRecord({ ...record, to: 'GBP', result: 75.5 });

    expect(service.history().map((r) => r.to)).toEqual(['GBP', 'EUR']);
    const stored = JSON.parse(localStorage.getItem('conversionHistory')!);
    expect(stored).toHaveLength(2);
    expect(stored[0].to).toBe('GBP');
  });

  it('restores previously saved history on creation', () => {
    localStorage.setItem('conversionHistory', JSON.stringify([record]));
    const service = TestBed.inject(HistoryService);
    expect(service.history()).toHaveLength(1);
    expect(service.history()[0].from).toBe('USD');
  });
});
