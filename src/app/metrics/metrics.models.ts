export interface LeaderDto {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  metric: 'pts' | 'ts' | 'efg' | 'usg' | string;
  value: number;      // za ts/efg/usg je 0–1, za pts je PPG
  games: number;
  minPerGame: number; // MPG
}

export interface PlayerMetricsDto {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  games: number;
  minutes: number;
  pts: number;
  fgm: number; fga: number;
  tpm: number; tpa: number;
  ftm: number; fta: number;
  tov: number;
  efg: number;   // 0–1
  ts: number;    // 0–1
  usg: number;   // 0–1
  ptsPerGame: number;
  minPerGame: number;
}

export interface TeamMetricsDto {
  teamId: number;
  teamName: string;
  season: string | null;
  games: number;
  teamPoints: number;
  oppPoints: number;
  teamPossessions: number;
  oppPossessions: number;
  teamMinutes: number;
  pace: number;
  ortg: number;
  drtg: number;
  efg: number;
  ts: number;
}

export interface GameMetricsDto {
  gameId: number;
  date: string | null;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  homePoss: number;
  awayPoss: number;
  pace: number;
  homeORtg: number; homeDRtg: number;
  awayORtg: number; awayDRtg: number;
}
