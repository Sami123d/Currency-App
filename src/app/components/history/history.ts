import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../services/history';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  history = computed(() => this.historyService.history());
  
  constructor(private historyService: HistoryService) {}
}
