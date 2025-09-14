import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { PlayersRoutingModule } from './players-routing.module';
import { PlayersListComponent } from './pages/players-list/players-list.component';
import { PlayerViewComponent } from './pages/player-view/player-view.component';
import { PlayerCreateComponent } from './pages/player-create/player-create.component';
import { PlayerEditComponent } from './pages/player-edit/player-edit.component';

@NgModule({
  declarations: [
    PlayersListComponent,
    PlayerViewComponent,
    PlayerCreateComponent,
    PlayerEditComponent
  ],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, PlayersRoutingModule]
})
export class PlayersModule {}
