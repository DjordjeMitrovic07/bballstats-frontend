import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayersListComponent } from './pages/players-list/players-list.component';
import { PlayerViewComponent } from './pages/player-view/player-view.component';
import { PlayerCreateComponent } from './pages/player-create/player-create.component';
import { PlayerEditComponent } from './pages/player-edit/player-edit.component';

// Ako imaš RoleGuard, možeš dodati:
// canActivate: [RoleGuard], data: { roles: ['ADMIN'] }

const routes: Routes = [
  { path: '', component: PlayersListComponent },
  { path: 'create', component: PlayerCreateComponent },    // ← PRE :id!
  { path: ':id/edit', component: PlayerEditComponent },
  { path: ':id', component: PlayerViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlayersRoutingModule {}
