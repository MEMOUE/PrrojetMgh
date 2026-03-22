import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionService, Permission } from '../services/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // 1. Vérifier que l'utilisateur est connecté
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // 2. ✅ Un compte HOTEL a TOUJOURS accès à tout
    if (this.permissionService.isHotelAccount) {
      return true;
    }

    // 3. Pour un compte USER, vérifier les permissions de la route
    const requiredPermissions: Permission[] = route.data['permissions'] ?? [];
    const requireAll: boolean = route.data['requireAll'] ?? false;

    // Pas de permissions définies sur la route → accès libre (authentifié suffit)
    if (requiredPermissions.length === 0) return true;

    const hasAccess = requireAll
      ? this.permissionService.hasAllPermissions(...requiredPermissions)
      : this.permissionService.hasAnyPermission(...requiredPermissions);

    if (!hasAccess) {
      console.warn(
        `🔒 Accès refusé pour ${state.url}. Permissions requises :`,
        requiredPermissions,
        '| Permissions utilisateur :',
        this.authService.currentUserValue?.permissions
      );
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
