import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loading = false;
  error: string | null = null;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.login(this.form.value as any).subscribe({
      next: (resp) => {
        this.auth.saveSession(resp);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Pogrešan email/lozinka (401)';
        this.loading = false;
      }
    });
  }
}
