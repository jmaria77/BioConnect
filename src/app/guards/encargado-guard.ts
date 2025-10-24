import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth';

export const encargadoGuard: CanActivateFn = () => {
  const auth: AuthService = inject(AuthService); // ✅ tipado explícito
  return auth.isEncargado();
};
