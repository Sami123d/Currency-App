import { Component, signal } from '@angular/core';
import { Converter } from './components/converter/converter';
import { History } from './components/history/history';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Converter, History],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('currency-app');
}
