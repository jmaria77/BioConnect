import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SyncService } from '../../services/sync';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class LoginPage implements OnInit {
  isAuthenticating = false;
  isOnline = true;
  syncStatus = { isOnline: false, pendingItems: 0 };

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private syncService: SyncService
  ) {}

  ngOnInit() {
    this.checkNetworkStatus();
    this.loadSyncStatus();
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
  }

  async loadSyncStatus() {
    this.syncStatus = await this.syncService.getSyncStatus();
  }

  async authenticateWithFace() {
    this.isAuthenticating = true;
    let loading: any = null;
    
    try {
      loading = await this.loadingController.create({
        message: 'Autenticando con reconocimiento facial...',
        spinner: 'crescent'
      });
      await loading.present();

      const isAuthenticated = await this.authService.loginWithFace();
      
      if (isAuthenticated) {
        await this.showToast('Autenticación exitosa', 'success');
        this.router.navigate(['/dashboard']);
      } else {
        await this.showToast('Autenticación fallida. Intenta nuevamente', 'danger');
      }
      
      await loading.dismiss();
    } catch (error) {
      console.error('Error en autenticación:', error);
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'Error en autenticación';
      if (error.message) {
        errorMessage = error.message;
      }
      
      await this.showToast(errorMessage, 'danger');
      if (loading) {
        await loading.dismiss();
      }
    } finally {
      this.isAuthenticating = false;
    }
  }

  async forceSync() {
    if (!this.isOnline) {
      await this.showToast('Sin conexión a internet', 'warning');
      return;
    }

    let loading: any = null;
    try {
      loading = await this.loadingController.create({
        message: 'Sincronizando datos...',
        spinner: 'crescent'
      });
      await loading.present();

      await this.syncService.forceSync();
      await this.loadSyncStatus();
      
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