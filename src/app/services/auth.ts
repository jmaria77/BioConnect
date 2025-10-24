// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

export interface User {
  nombre: string;
  correo: string;
  contraseña: string;
  rol: 'encargado' | 'trabajador';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'users';
  private currentUserKey = 'currentUser';

  register(user: User): boolean {
    // Tipamos el array como User[]
    const users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    // Tipamos la variable u
    if (users.find((u: User) => u.correo === user.correo)) return false; // ya existe
    users.push(user);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return true;
  }

  // auth.ts
  getUserByNombre(nombre: string): User | null {
    const users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return users.find(u => u.nombre === nombre) || null;
  }

  login(correo: string, contraseña: string): User | null {
    const users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const user: User | undefined = users.find((u: User) => u.correo === correo && u.contraseña === contraseña);
    if (user) localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    return user || null;
  }

  logout(): void {
    localStorage.removeItem(this.currentUserKey);
  }

  getCurrentUser(): User | null {
    const user: User | null = JSON.parse(localStorage.getItem(this.currentUserKey) || 'null');
    return user;
  }

  isEncargado(): boolean {
    return this.getCurrentUser()?.rol === 'encargado';
  }
}
