import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'jwt';
const ROLE_KEY = 'role';
const EMAIL_KEY = 'email';
const USERNAME_KEY = 'username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService, private router: Router) {}

  login(payload: LoginRequest) {
    return this.api.post<LoginResponse>('/auth/login', payload);
  }

  saveSession(resp: LoginResponse) {
    localStorage.setItem(TOKEN_KEY, resp.token);
    localStorage.setItem(ROLE_KEY, resp.role);
    localStorage.setItem(EMAIL_KEY, resp.email);
    if (resp.username) localStorage.setItem(USERNAME_KEY, resp.username);
  }

  logout(redirect = true) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(USERNAME_KEY);
    if (redirect) this.router.navigate(['/auth/login']);
  }

  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }
  get role(): string | null { return localStorage.getItem(ROLE_KEY); }
  get email(): string | null { return localStorage.getItem(EMAIL_KEY); }

  isLoggedIn(): boolean { return !!this.token; }

  hasRole(roles: string[] | undefined): boolean {
    if (!roles || roles.length === 0) return true;
    const current = this.role;
    return !!current && roles.includes(current);
  }
}
