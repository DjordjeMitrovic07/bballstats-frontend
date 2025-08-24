import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsListComponent } from './pages/teams-list/teams-list.component';
import { TeamCreateComponent } from './pages/team-create/team-create.component';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  { path: '', component: TeamsListComponent },
  { path: 'new', component: TeamCreateComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamsRoutingModule {}
