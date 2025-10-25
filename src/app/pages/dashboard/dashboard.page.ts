import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth';
import { SyncService } from '../../services/sync';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  isOnline = true;
  syncStatus = { isOnline: false, pendingItems: 0 };

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private syncService: SyncService
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    await this.checkNetworkStatus();
    await this.loadSyncStatus();
  }

  async loadUserData() {
    this.currentUser = await this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
  }

  async loadSyncStatus() {
    this.syncStatus = await this.syncService.getSyncStatus();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  async reauthenticate() {
    let loading: any = null;
    try {
      loading = await this.loadingController.create({
        message: 'Reautenticando...',
        spinner: 'crescent'
      });
      await loading.present();

      const isAuthenticated = await this.authService.loginWithFace();
      
      if (isAuthenticated) {
        await this.showToast('Reautenticación exitosa', 'success');
      } else {
        await this.showToast('Reautenticación fallida', 'danger');
      }
      
      await loading.dismiss();
    } catch (error) {
      console.error('Error en reautenticación:', error);
      await this.showToast('Error en reautenticación', 'danger');
      if (loading) {
        await loading.dismiss();
      }
    }
  }

  async viewProfile() {
    if (this.currentUser) {
      const alert = await this.alertController.create({
        header: 'Perfil de Usuario',
        message: `
          <strong>Usuario:</strong> ${this.currentUser.username}<br>
          <strong>Rol:</strong> ${this.currentUser.role}<br>
          <strong>ID:</strong> ${this.currentUser.id}<br>
          <strong>Estado:</strong> ${this.currentUser.isOnline ? 'En línea' : 'Offline'}<br>
          <strong>Última sincronización:</strong> ${this.currentUser.lastSync ? this.currentUser.lastSync.toLocaleString() : 'Nunca'}
        `,
        buttons: ['Cerrar']
      });
      await alert.present();
    }
  }

  async syncNow() {
    if (!this.isOnline) {
      await this.showToast('Sin conexión a internet', 'warning');
      return;
    }

    let loading: any = null;
    try {
      loading = await this.loadingController.create({
        message: 'Sincronizando...',
        spinner: 'crescent'
      });
      await loading.present();

      await this.syncService.forceSync();
      await this.loadSyncStatus();
      await this.loadUserData();
      
      await this.showToast('Sincronización completada', 'success');
      await loading.dismiss();
    } catch (error) {
      console.error('Error en sincronización:', error);
      await this.showToast('Error en sincronización', 'danger');
      if (loading) {
        await loading.dismiss();
      }
    }
  }

  async forceSync() {
    await this.syncNow();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}