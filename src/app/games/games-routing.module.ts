// src/app/games/games-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamesListComponent } from './pages/games-list/games-list.component';
import { GameCreateComponent } from './pages/game-create/game-create.component';
import { GameDetailComponent } from './pages/game-detail/game-detail.component';
import { RoleGuard } from '../core/guards/role.guard';
import { BoxscoresListComponent } from './pages/boxscores/boxscores-list.component';
import { BoxscoreFormComponent } from './pages/boxscores/boxscore-form.component';

const routes: Routes = [
  { path: '', component: GamesListComponent },
  { path: 'new', component: GameCreateComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
  { path: ':id', component: GameDetailComponent },

  // BoxScores
  { path: ':id/boxscores', component: BoxscoresListComponent },
  { path: ':id/boxscores/new', component: BoxscoreFormComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
  { path: ':id/boxscores/:boxId/edit', component: BoxscoreFormComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GamesRoutingModule {}
