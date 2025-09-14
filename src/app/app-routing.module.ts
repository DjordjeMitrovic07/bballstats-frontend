import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { MetricsHomeComponent } from './metrics/pages/metrics-home/metrics-home.component';
import { ComparePlayersComponent } from './metrics/pages/compare/compare-players.component'; // <— NOVO


const routes: Routes = [
  // home -> teams
  { path: '', redirectTo: 'teams', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'teams',
    canActivate: [AuthGuard],
    loadChildren: () => import('./teams/teams.module').then(m => m.TeamsModule),
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    // placeholder: možeš ovde kasnije staviti admin modul
    loadChildren: () => import('./teams/teams.module').then(m => m.TeamsModule),
  },
  {
    path: 'players',
    loadChildren: () => import('./players/players.module').then(m => m.PlayersModule),
  },
  {
    path: 'games',
    loadChildren: () => import('./games/games.module').then(m => m.GamesModule),
  },
  { path: 'metrics', component: MetricsHomeComponent },

  { path: 'metrics/compare', component: ComparePlayersComponent },

  // fallback
  { path: '**', redirectTo: 'teams' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
