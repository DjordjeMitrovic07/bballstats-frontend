import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsListComponent } from './pages/teams-list/teams-list.component';
import { TeamCreateComponent } from './pages/team-create/team-create.component';

@NgModule({
  declarations: [TeamsListComponent, TeamCreateComponent],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, TeamsRoutingModule]
})
export class TeamsModule {}
