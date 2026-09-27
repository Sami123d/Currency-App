import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Converter } from './converter';
import { HistoryService } from '../../services/history';
import { environment } from '../../../environments/environment';

describe('Converter', () => {
  let component: Converter;
  let fixture: ComponentFixture<Converter>;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Converter],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Converter);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // triggers ngOnInit -> GET /currencies
  });

  afterEach(() => http.verify());

  const flushCurrencies = () =>
    http.expectOne(`${api}/currencies`).flush({
      data: { USD: { name: 'US Dollar' }, EUR: { name: 'Euro' } },
    });

  it('loads the currency list from the backend on init', () => {
    flushCurrencies();
    expect(component.currencies()).toEqual([
      { code: 'USD', name: 'US Dollar' },
      { code: 'EUR', name: 'Euro' },
    ]);
  });

  it('shows an error when the currency list cannot be loaded', () => {
    http
      .expectOne(`${api}/currencies`)
      .flush('boom', { status: 502, statusText: 'Bad Gateway' });
    fixture.detectChanges();
    expect(component.error()).toContain('Could not load the currency list');
    expect(fixture.nativeElement.querySelector('.error')).not.toBeNull();
  });

  it("uses /latest for today's date and records the conversion", () => {
    flushCurrencies();
    component.form.setValue({ from: 'USD', to: 'EUR', amount: 100, date: new Date() });
    component.convert();

    http.expectOne(`${api}/latest?base=USD`).flush({ data: { EUR: 0.9 } });

    expect(component.result()).toBeCloseTo(90);
    expect(component.loading()).toBe(false);
    const history = TestBed.inject(HistoryService).history();
    expect(history[0]).toMatchObject({ from: 'USD', to: 'EUR', amount: 100 });
  });

  it('uses /historical for a past date', () => {
    flushCurrencies();
    component.form.setValue({
      from: 'USD',
      to: 'EUR',
      amount: 10,
      date: new Date(2025, 0, 2),
    });
    component.convert();

    http
      .expectOne(`${api}/historical?base=USD&date=2025-01-02`)
      .flush({ data: { '2025-01-02': { EUR: 0.97 } } });

    expect(component.result()).toBeCloseTo(9.7);
  });

  it('surfaces a failed conversion instead of failing silently', () => {
    flushCurrencies();
    component.form.setValue({ from: 'USD', to: 'EUR', amount: 1, date: new Date() });
    component.convert();

    http
      .expectOne(`${api}/latest?base=USD`)
      .flush({ message: 'x' }, { status: 400, statusText: 'Bad Request' });

    expect(component.error()).toContain('Conversion failed');
    expect(component.loading()).toBe(false);
    expect(component.result()).toBeNull();
  });

  it('does not call the API when the form is invalid', () => {
    flushCurrencies();
    component.form.patchValue({ from: '', to: 'EUR' });
    component.convert();
    http.expectNone(() => true);
  });
});
