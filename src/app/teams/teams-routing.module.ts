import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeamsListComponent } from './pages/teams-list/teams-list.component';
import { TeamCreateComponent } from './pages/team-create/team-create.component';
import { TeamEditComponent } from './pages/team-edit/team-edit.component';
import { TeamViewComponent } from './pages/team-view/team-view.component'; // <— NOVO

import { AuthGuard } from '../core/guards/auth.guard';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  // /teams
  { path: '', component: TeamsListComponent, canActivate: [AuthGuard] },

  // /teams/create (samo admin)
  {
    path: 'create',
    component: TeamCreateComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
  },

  // /teams/:id  (profil tima)
  { path: ':id', component: TeamViewComponent, canActivate: [AuthGuard] },

  // /teams/:id/edit (samo admin)
  {
    path: ':id/edit',
    component: TeamEditComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamsRoutingModule {}
