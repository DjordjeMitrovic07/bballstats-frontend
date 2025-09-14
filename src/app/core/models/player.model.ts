export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  jerseyNumber?: number;
  heightCm?: number;
  weightKg?: number;
  teamId?: number;
  team?: { id: number; name: string } | null; // <— dodato
  teamName?: string;
}

export type PlayerCreateRequest = Omit<Player, 'id' | 'teamName'>;
export type PlayerUpdateRequest = Omit<Player, 'teamName' | 'id'>;
