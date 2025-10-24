import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
  ]
})
export class LoginPage {
  nombre = '';
  biometria = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  login() {
    const biometriaData = JSON.parse(localStorage.getItem('biometria') || '{}');
    if (!this.nombre || !this.biometria) {
      this.error = 'Debe ingresar usuario y capturar biometría';
      return;
    }

    if (biometriaData[this.nombre] === this.biometria) {
      const user = this.auth.getUserByNombre(this.nombre);
      if (user) {
        this.auth.login(user.nombre, user.contraseña);
        this.router.navigate([user.rol === 'encargado' ? '/reconocimiento' : '/historial']);
      }
    } else {
      this.error = 'Usuario o biometría incorrectos';
    }
  }

  capturarBiometria() {
    this.biometria = prompt('Simulación de captura biométrica: ingrese patrón') || '';
  }
}
