import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'teams', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'teams',
    canActivate: [AuthGuard],
    loadChildren: () => import('./teams/teams.module').then(m => m.TeamsModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./teams/teams.module').then(m => m.TeamsModule) // placeholder
  },

  { path: 'players', loadChildren: () => import('./players/players.module').then(m => m.PlayersModule) },

  { path: '**', redirectTo: 'teams' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
