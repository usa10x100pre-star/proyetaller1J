import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage {
  username = '';
  password = '';
  errorMsg = '';

  constructor(
    public http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.errorMsg = '';

    if (!this.username || !this.password) {
      this.errorMsg = 'Debe ingresar usuario y contraseña';
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (resp: any) => {
        localStorage.setItem('token', resp.token);
        localStorage.setItem('nombreCompleto', resp.nombre || resp.nombreCompleto);
        localStorage.setItem('login', resp.login || this.username);
        this.router.navigate(['/materias']);
      },
      error: () => {
        this.errorMsg = 'Credenciales incorrectas';
      }
    });
  }
}
