import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Network } from '@capacitor/network';
import { AuthService, User } from './auth';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private isOnline = false;

  constructor(
    private storage: Storage,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    this.checkNetworkStatus();
    this.setupNetworkListener();
  }

  private async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
  }

  private setupNetworkListener() {
    Network.addListener('networkStatusChange', (status) => {
      this.isOnline = status.connected;
      if (status.connected) {
        this.syncPendingData();
      }
    });
  }

  async syncPendingData(): Promise<void> {
    if (!this.isOnline) {
      console.log('Sin conexión, no se puede sincronizar');
      return;
    }

    try {
      const syncQueue = await this.storage.get('syncQueue') || [];
      const pendingItems = syncQueue.filter((item: any) => !item.synced);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          item.synced = true;
        } catch (error) {
          console.error('Error sincronizando item:', error);
        }
      }

      // Actualizar cola de sincronización
      await this.storage.set('syncQueue', syncQueue);
      
      // Sincronizar usuarios locales
      await this.syncLocalUsers();
      
    } catch (error) {
      console.error('Error en sincronización:', error);
    }
  }

  private async syncItem(item: any): Promise<void> {
    switch (item.action) {
      case 'register':
        await this.syncUserRegistration(item.data);
        break;
      case 'update':
        await this.syncUserUpdate(item.data);
        break;
      default:
        console.log('Acción de sincronización no reconocida:', item.action);
    }
  }

  private async syncUserRegistration(user: User): Promise<void> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(
        `${user.username}@bioconnect.local`,
        this.generatePassword(user.id)
      );

      // Guardar datos del usuario en Firestore
      await this.firestore.collection('users').doc(userCredential.user?.uid).set({
        username: user.username,
        role: user.role,
        localId: user.id,
        createdAt: new Date(),
        isOnline: false
      });

      // Actualizar usuario local con ID de Firebase
      user.firebaseId = userCredential.user?.uid;
      user.isOnline = true;
      user.lastSync = new Date();
      
      await this.storage.set('currentUser', user);
      await this.updateLocalUser(user);

      console.log('Usuario sincronizado con Firebase');
    } catch (error) {
      console.error('Error sincronizando registro de usuario:', error);
      throw error;
    }
  }

  private async syncUserUpdate(user: User): Promise<void> {
    try {
      if (user.firebaseId) {
        await this.firestore.collection('users').doc(user.firebaseId).update({
          username: user.username,
          role: user.role,
          lastSync: new Date()
        });

        user.isOnline = true;
        user.lastSync = new Date();
        
        await this.storage.set('currentUser', user);
        await this.updateLocalUser(user);
      }
    } catch (error) {
      console.error('Error sincronizando actualización de usuario:', error);
      throw error;
    }
  }

  private async syncLocalUsers(): Promise<void> {
    try {
      const localUsers = await this.authService.getLocalUsers();
      const firebaseUsers = await this.getFirebaseUsers();

      // Sincronizar usuarios que no están en Firebase
      for (const localUser of localUsers) {
        if (!localUser.firebaseId) {
          await this.syncUserRegistration(localUser);
        }
      }

      // Actualizar usuarios locales con datos de Firebase
      for (const firebaseUser of firebaseUsers) {
        const localUser = localUsers.find(u => u.firebaseId === firebaseUser.id);
        if (localUser) {
          localUser.lastSync = new Date();
          await this.updateLocalUser(localUser);
        }
      }

    } catch (error) {
      console.error('Error sincronizando usuarios locales:', error);
    }
  }

  private async getFirebaseUsers(): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection('users').get().toPromise();
      if (snapshot) {
        return snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo usuarios de Firebase:', error);
      return [];
    }
  }

  private async updateLocalUser(user: User): Promise<void> {
    try {
      const localUsers = await this.storage.get('localUsers') || [];
      const index = localUsers.findIndex((u: User) => u.id === user.id);
      
      if (index >= 0) {
        localUsers[index] = user;
      } else {
        localUsers.push(user);
      }
      
      await this.storage.set('localUsers', localUsers);
    } catch (error) {
      console.error('Error actualizando usuario local:', error);
    }
  }

  private generatePassword(userId: string): string {
    // Generar contraseña basada en el ID del usuario
    return btoa(userId + '_bioconnect_2024');
  }

  async getSyncStatus(): Promise<{ isOnline: boolean; pendingItems: number }> {
    const syncQueue = await this.storage.get('syncQueue') || [];
    const pendingItems = syncQueue.filter((item: any) => !item.synced).length;
    
    return {
      isOnline: this.isOnline,
      pendingItems
    };
  }

  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingData();
    }
  }
}