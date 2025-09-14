import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TeamsRoutingModule } from './teams-routing.module';

import { TeamsListComponent } from './pages/teams-list/teams-list.component';
import { TeamCreateComponent } from './pages/team-create/team-create.component';
import { TeamEditComponent } from './pages/team-edit/team-edit.component';
import { TeamViewComponent } from './pages/team-view/team-view.component';
import { MetricsModule } from '../metrics/metrics.module';

@NgModule({
  declarations: [
    TeamsListComponent,
    TeamCreateComponent,
    TeamEditComponent,
    TeamViewComponent,
  ],
  imports: [
    CommonModule,         // *ngIf, *ngFor, |date
    FormsModule,          // [(ngModel)]
    ReactiveFormsModule,  // [formGroup], formControlName
    TeamsRoutingModule,
    MetricsModule,
  ],
})
export class TeamsModule {}
