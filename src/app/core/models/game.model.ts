export interface TeamLite {
  id: number;
  name: string;
}

export interface Game {
  id: number;
  dateTime: string;   // ISO string
  season: string;
  homeTeam: TeamLite;
  awayTeam: TeamLite;
  scoreHome?: number | null;
  scoreAway?: number | null;
}

export interface GameCreateRequest {
  dateTime: string;
  season: string;
  homeTeamId: number;
  awayTeamId: number;
}
