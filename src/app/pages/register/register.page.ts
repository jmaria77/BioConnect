import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FaceRecognitionService } from '../../services/face-recognition';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class RegisterPage implements OnInit {
  userData = {
    username: '',
    role: '' as 'trabajador' | 'encargador'
  };

  biometricCaptured = false;
  isCapturing = false;
  isRegistering = false;
  isOnline = true;
  capturedImageUri: string = '';
  faceDescriptor: Float32Array | null = null;

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private faceRecognition: FaceRecognitionService
  ) {}

  ngOnInit() {
    this.checkNetworkStatus();
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
  }

  async testCamera() {
    try {
      console.log('Probando cámara...');
      await this.showToast('Abriendo cámara para prueba...', 'primary');
      
      const imageUri = await this.faceRecognition.capturePhoto();
      console.log('Cámara funcionando correctamente:', imageUri);
      
      await this.showToast('¡Cámara funcionando correctamente!', 'success');
    } catch (error) {
      console.error('Error probando cámara:', error);
      
      let errorMessage = 'Error accediendo a la cámara';
      if (error.message) {
        errorMessage = error.message;
      }
      
      await this.showToast(errorMessage, 'danger');
    }
  }

  async captureBiometric() {
    this.isCapturing = true;
    let loading: any = null;
    
    try {
      loading = await this.loadingController.create({
        message: 'Capturando biometría...',
        spinner: 'crescent'
      });
      await loading.present();

      console.log('Iniciando captura de biometría...');
      
      // Capturar foto
      const imageUri = await this.faceRecognition.capturePhoto();
      console.log('Foto capturada:', imageUri);
      
      // Procesar cara
      const faceDescriptor = await this.faceRecognition.processFace(imageUri);
      console.log('Descriptor facial procesado:', faceDescriptor ? 'Exitoso' : 'Fallido');
      
      if (faceDescriptor) {
        // Guardar los datos capturados
        this.capturedImageUri = imageUri;
        this.faceDescriptor = faceDescriptor;
        this.biometricCaptured = true;
        
        console.log('Biometría capturada y guardada exitosamente');
        await this.showToast('Biometría capturada exitosamente', 'success');
      } else {
        await this.showToast('No se pudo detectar un rostro válido. Asegúrate de que tu rostro esté bien iluminado y centrado en la cámara.', 'danger');
      }
      
      await loading.dismiss();
    } catch (error) {
      console.error('Error capturando biometría:', error);
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'Error capturando biometría';
      if (error.message) {
        errorMessage = error.message;
      }
      
      await this.showToast(errorMessage, 'danger');
      if (loading) {
        await loading.dismiss();
      }
    } finally {
      this.isCapturing = false;
    }
  }

  async onRegister() {
    if (!this.userData.username || !this.userData.role || !this.biometricCaptured) {
      await this.showToast('Por favor completa todos los campos y captura tu biometría', 'warning');
      return;
    }

    if (!this.faceDescriptor) {
      await this.showToast('Error: No se encontró el descriptor facial. Por favor, captura tu biometría nuevamente.', 'danger');
      return;
    }

    this.isRegistering = true;
    let loading: any = null;
    
    try {
      loading = await this.loadingController.create({
        message: 'Registrando usuario...',
        spinner: 'crescent'
      });
      await loading.present();

      console.log('Iniciando registro de usuario...');
      
      // Usar los datos ya capturados en lugar de capturar nuevamente
      const success = await this.authService.registerUserWithBiometric(
        this.userData.username,
        this.userData.role,
        this.faceDescriptor
      );

      if (success) {
        await this.showToast('Usuario registrado exitosamente', 'success');
        this.router.navigate(['/dashboard']);
      } else {
        await this.showToast('Error registrando usuario', 'danger');
      }
      
      await loading.dismiss();
    } catch (error) {
      console.error('Error en registro:', error);
      await this.showToast('Error registrando usuario', 'danger');
      if (loading) {
        await loading.dismiss();
      }
    } finally {
      this.isRegistering = false;
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