export interface Team {
  id: number;
  name: string;
  city: string;
  foundedYear?: number;
  playersCount?: number;
}

export interface TeamCreateRequest {
  name: string;
  city: string;
  foundedYear?: number | null;
}
