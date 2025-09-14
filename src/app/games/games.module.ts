// src/app/games/games.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GamesRoutingModule } from './games-routing.module';
import { GamesListComponent } from './pages/games-list/games-list.component';
import { GameCreateComponent } from './pages/game-create/game-create.component';
import { GameDetailComponent } from './pages/game-detail/game-detail.component';
import { BoxscoresListComponent } from './pages/boxscores/boxscores-list.component';
import { BoxscoreFormComponent } from './pages/boxscores/boxscore-form.component';
import { MetricsModule } from '../metrics/metrics.module';

@NgModule({
  declarations: [
    GamesListComponent,
    GameCreateComponent,
    GameDetailComponent,
    BoxscoresListComponent,
    BoxscoreFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    GamesRoutingModule,
    MetricsModule,
  ]
})
export class GamesModule {}
