import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MetricsHomeComponent } from './pages/metrics-home/metrics-home.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { ComparePlayersComponent } from './pages/compare/compare-players.component';
import { TeamMetricsCardComponent } from './components/team-metrics-card/team-metrics-card.component';
import { GameMetricsCardComponent } from './components/game-metrics-card/game-metrics-card.component';

@NgModule({
  declarations: [
    MetricsHomeComponent,
    LeaderboardComponent,
    ComparePlayersComponent,
    TeamMetricsCardComponent,
    GameMetricsCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    MetricsHomeComponent,
    LeaderboardComponent,
    ComparePlayersComponent,
    TeamMetricsCardComponent,
    GameMetricsCardComponent,
  ]
})
export class MetricsModule {}
