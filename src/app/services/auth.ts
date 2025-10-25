import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FaceRecognitionService } from './face-recognition';

export interface User {
  id: string;
  username: string;
  role: 'trabajador' | 'encargador';
  biometricData?: Float32Array;
  isOnline: boolean;
  lastSync?: Date;
  firebaseId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor(
    private storage: Storage,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private faceRecognition: FaceRecognitionService
  ) {
    this.initializeStorage();
  }

  private async initializeStorage() {
    await this.storage.create();
  }

  async registerUser(username: string, role: 'trabajador' | 'encargador'): Promise<boolean> {
    try {
      // Capturar foto para reconocimiento facial
      const imageUri = await this.faceRecognition.capturePhoto();
      const faceDescriptor = await this.faceRecognition.processFace(imageUri);
      
      if (!faceDescriptor) {
        throw new Error('No se pudo procesar el rostro');
      }

      return await this.registerUserWithBiometric(username, role, faceDescriptor);
    } catch (error) {
      console.error('Error registrando usuario:', error);
      return false;
    }
  }

  async registerUserWithBiometric(username: string, role: 'trabajador' | 'encargador', faceDescriptor: Float32Array): Promise<boolean> {
    try {
      console.log('Registrando usuario con biometría pre-capturada...');
      
      // Crear usuario
      const userId = this.generateUserId();
      const user: User = {
        id: userId,
        username,
        role,
        biometricData: faceDescriptor,
        isOnline: false
      };

      console.log('Usuario creado:', { id: userId, username, role });

      // Guardar usuario localmente
      await this.storage.set('currentUser', user);
      console.log('Usuario guardado en storage local');
      
      // Guardar descriptor facial
      await this.faceRecognition.saveFaceDescriptor(userId, faceDescriptor);
      console.log('Descriptor facial guardado');
      
      // Agregar a lista de usuarios locales
      await this.addUserToLocalList(user);
      console.log('Usuario agregado a lista local');
      
      // Guardar en cola de sincronización
      await this.addToSyncQueue('register', user);
      console.log('Usuario agregado a cola de sincronización');
      
      this.currentUser = user;
      return true;
    } catch (error) {
      console.error('Error registrando usuario con biometría:', error);
      return false;
    }
  }

  async loginWithFace(): Promise<boolean> {
    try {
      // Obtener usuarios registrados localmente
      const users = await this.getLocalUsers();
      
      for (const user of users) {
        const isAuthenticated = await this.faceRecognition.authenticateUser(user.id);
        if (isAuthenticated) {
          this.currentUser = user;
          await this.storage.set('currentUser', user);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error en login facial:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    try {
      const user = await this.storage.get('currentUser');
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    await this.storage.remove('currentUser');
  }

  async getLocalUsers(): Promise<User[]> {
    try {
      const users = await this.storage.get('localUsers') || [];
      return users;
    } catch (error) {
      console.error('Error obteniendo usuarios locales:', error);
      return [];
    }
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async addToSyncQueue(action: string, data: any): Promise<void> {
    try {
      const syncQueue = await this.storage.get('syncQueue') || [];
      syncQueue.push({
        action,
        data,
        timestamp: new Date(),
        synced: false
      });
      await this.storage.set('syncQueue', syncQueue);
    } catch (error) {
      console.error('Error agregando a cola de sincronización:', error);
    }
  }

  private async addUserToLocalList(user: User): Promise<void> {
    try {
      const localUsers = await this.storage.get('localUsers') || [];
      localUsers.push(user);
      await this.storage.set('localUsers', localUsers);
    } catch (error) {
      console.error('Error agregando usuario a lista local:', error);
    }
  }

  async isUserAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}