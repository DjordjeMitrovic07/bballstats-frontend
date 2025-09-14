import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Team } from '../../../core/models/team.model';
import { Player } from '../../../core/models/player.model';
import { TeamsService } from '../../services/teams.service';
import { PlayersService } from '../../../players/services/players.service';
import { GamesService, GameRow } from '../../../games/services/games.service';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.css'],
  standalone: false
})
export class TeamViewComponent implements OnInit {
  loading = true;
  error: string | null = null;

  team!: Team;
  teamId!: number;

  // Koristimo iste 3 sezone kao i na drugim ekranima
  seasons: string[] = ['2022/23', '2023/24', '2024/25'];
  season = '2024/25';

  games: GameRow[] = [];
  view: GameRow[] = [];
  roster: Player[] = [];

  // KPI
  wins = 0;
  losses = 0;
  ppg = 0;      // prosečno postignuti poeni
  oppg = 0;     // prosečno primljeni poeni

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teams: TeamsService,
    private players: PlayersService,
    private gamesSvc: GamesService
  ) {}

  ngOnInit(): void {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchTeam();
  }

  onSeasonChange(s: string): void {
    this.season = s;
    this.fetchGamesForSeason();
    // TeamMetricsCard se oslanja na [season] @Input i sam će se reload-ovati u ngOnChanges,
    // pa ovde nije potrebna dodatna logika.
  }

  // ---------- UI helperi ----------
  teamLogo(id?: number): string {
    return id ? `/assets/teams/${id}.png` : '/assets/teams/placeholder.png';
  }
  imgFallback(ev: Event): void {
    (ev.target as HTMLImageElement).src = '/assets/teams/placeholder.png';
  }
  goPlayer(p: Player): void {
    if (p.id) this.router.navigate(['/players', p.id]);
  }

  // ---------- Učitavanje ----------
  private fetchTeam(): void {
    this.loading = true; this.error = null;

    this.teams.get(this.teamId).subscribe({
      next: t => {
        this.team = t;
        this.fetchRoster();
        this.fetchGamesForSeason();
      },
      error: err => {
        this.error = err?.error?.message || 'Greška pri učitavanju tima.';
        this.loading = false;
      }
    });
  }

  private fetchRoster(): void {
    // Nemamo poseban endpoint, pa filtriramo sve igrače po teamId
    this.players.list().subscribe({
      next: list => {
        const all = Array.isArray(list) ? list : [];
        this.roster = all.filter(p => p.teamId === this.teamId);
      },
      error: _ => { this.roster = []; }
    });
  }

  private fetchGamesForSeason(): void {
    this.loading = true; this.error = null;

    const teamName = (this.team?.name || '').trim().toLowerCase();
    this.gamesSvc.list({ season: this.season }).subscribe({
      next: rows => {
        const all = Array.isArray(rows) ? rows : [];
        // Uzmemo samo mečeve gde tim učestvuje (po imenu – bekend ID nije obavezan)
        const mine = all.filter(g => {
          const h = (g.homeTeamName || '').trim().toLowerCase();
          const a = (g.awayTeamName || '').trim().toLowerCase();
          return h === teamName || a === teamName;
        }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

        this.games = mine;
        this.computeKpis();
        this.view = [...this.games];
        this.loading = false;
      },
      error: _ => {
        this.error = 'Greška pri učitavanju utakmica za sezonu.';
        this.loading = false;
      }
    });
  }

  private computeKpis(): void {
    let w = 0, l = 0, ptsFor = 0, ptsAgainst = 0, nFinished = 0;

    const my = (this.team?.name || '').trim().toLowerCase();

    for (const g of this.games) {
      // Računamo samo završene mečeve (skorovi postoje)
      const hs = typeof g.homeScore === 'number' ? g.homeScore : null;
      const as = typeof g.awayScore === 'number' ? g.awayScore : null;
      if (hs == null || as == null) continue;

      const home = (g.homeTeamName || '').trim().toLowerCase();
      const away = (g.awayTeamName || '').trim().toLowerCase();

      const iAmHome = home === my;
      const iAmAway = away === my;
      if (!iAmHome && !iAmAway) continue;

      const mine = iAmHome ? hs : as;
      const opp  = iAmHome ? as : hs;

      ptsFor += mine;
      ptsAgainst += opp;
      nFinished += 1;

      if (mine > opp) w++; else l++;
    }

    this.wins = w;
    this.losses = l;
    this.ppg = nFinished ? +(ptsFor / nFinished).toFixed(1) : 0;
    this.oppg = nFinished ? +(ptsAgainst / nFinished).toFixed(1) : 0;
  }

  opponentName(g: GameRow): string {
    const my = (this.team?.name || '').trim();
    return (g.homeTeamName === my) ? (g.awayTeamName || '') : (g.homeTeamName || '');
  }

  resultBadge(g: GameRow): 'W' | 'L' | '-' {
    const hs = g.homeScore, as = g.awayScore;
    if (hs == null || as == null) return '-';
    const my = (this.team?.name || '').trim();
    const mine = g.homeTeamName === my ? hs : as;
    const opp  = g.homeTeamName === my ? as : hs;
    return mine > opp ? 'W' : 'L';
  }

  scoreText(g: GameRow): string {
    const hs = g.homeScore, as = g.awayScore;
    if (hs == null || as == null) return '—';
    return `${hs} : ${as}`;
  }
}
