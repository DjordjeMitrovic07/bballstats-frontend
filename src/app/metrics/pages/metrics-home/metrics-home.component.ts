import { Component } from '@angular/core';

@Component({
  selector: 'app-metrics-home',
  standalone:false,
  templateUrl: './metrics-home.component.html',
  styleUrls: ['./metrics-home.component.css']
})
export class MetricsHomeComponent {
  seasons = ['2023/24', '2024/25'];
  season = '2024/25';
  minGames = 0;
  minMpg = 0;

  view: 'players' | 'teams' = 'players';   // ⬅️ toggle

}
