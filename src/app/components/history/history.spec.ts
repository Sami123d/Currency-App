import { ComponentFixture, TestBed } from '@angular/core/testing';

import { History } from './history';
import { HistoryService } from '../../services/history';

describe('History', () => {
  let fixture: ComponentFixture<History>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [History],
    }).compileComponents();

    fixture = TestBed.createComponent(History);
  });

  it('shows an empty state when there are no conversions', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No conversions yet.');
  });

  it('renders records added to the history service', () => {
    TestBed.inject(HistoryService).addRecord({
      from: 'USD',
      to: 'EUR',
      amount: 100,
      result: 87.79,
      date: '2026-09-27',
      timestamp: new Date(),
    });
    fixture.detectChanges();

    const records = fixture.nativeElement.querySelectorAll('.record');
    expect(records.length).toBe(1);
    expect(records[0].textContent).toContain('100 USD = 87.79 EUR');
  });
});
