import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

// Correspond exactement aux TypePermission du backend
export enum Permission {
  // Réservations
  VOIR_RESERVATIONS = 'VOIR_RESERVATIONS',
  CREER_RESERVATION = 'CREER_RESERVATION',
  MODIFIER_RESERVATION = 'MODIFIER_RESERVATION',
  ANNULER_RESERVATION = 'ANNULER_RESERVATION',

  // Restaurant
  VOIR_COMMANDES = 'VOIR_COMMANDES',
  CREER_COMMANDE = 'CREER_COMMANDE',
  MODIFIER_COMMANDE = 'MODIFIER_COMMANDE',
  GERER_MENU = 'GERER_MENU',

  // Stock / Économat
  VOIR_STOCK = 'VOIR_STOCK',
  MODIFIER_STOCK = 'MODIFIER_STOCK',
  GERER_FOURNISSEURS = 'GERER_FOURNISSEURS',
  PASSER_COMMANDES = 'PASSER_COMMANDES',

  // Comptabilité
  VOIR_COMPTABILITE = 'VOIR_COMPTABILITE',
  MODIFIER_COMPTABILITE = 'MODIFIER_COMPTABILITE',
  GENERER_RAPPORTS = 'GENERER_RAPPORTS',

  // Configuration
  VOIR_CONFIGURATION = 'VOIR_CONFIGURATION',
  MODIFIER_CONFIGURATION = 'MODIFIER_CONFIGURATION',

  // Employés
  GERER_EMPLOYES = 'GERER_EMPLOYES',
  VOIR_EMPLOYES = 'VOIR_EMPLOYES',

  // Admin complet (compte HOTEL)
  ACCES_COMPLET = 'ACCES_COMPLET',
}

@Injectable({ providedIn: 'root' })
export class PermissionService {

  constructor(private authService: AuthService) {}

  // ── Compte connecté ───────────────────────────────────────────

  get isHotelAccount(): boolean {
    return this.authService.currentUserValue?.accountType === 'HOTEL';
  }

  get isUserAccount(): boolean {
    return this.authService.currentUserValue?.accountType === 'USER';
  }

  get hotelId(): number | null {
    return this.authService.currentUserValue?.hotelId ?? null;
  }

  get currentUserName(): string {
    const u = this.authService.currentUserValue;
    if (!u) return '';
    // Pour un compte HOTEL le nom est dans `name`, pour USER dans firstName/lastName
    return u.firstName && u.lastName
      ? `${u.firstName} ${u.lastName}`
      : u.name ?? '';
  }

  get roles(): string[] {
    return this.authService.currentUserValue?.roles ?? [];
  }

  // ── Vérifications ─────────────────────────────────────────────

  /**
   * Un compte HOTEL a accès à tout.
   * Un compte USER doit avoir la permission explicitement.
   */
  hasPermission(permission: Permission): boolean {
    if (this.isHotelAccount) return true;

    const user = this.authService.currentUserValue;
    if (!user) return false;

    // Les permissions arrivent du backend sous forme de chaînes
    const perms: string[] = (user as any).permissions ?? [];
    return perms.includes(permission) || perms.includes(Permission.ACCES_COMPLET);
  }

  hasAnyPermission(...permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  hasAllPermissions(...permissions: Permission[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }

  // ── Accès par module (utilisé dans la navigation) ─────────────

  get canAccessReservations(): boolean {
    return this.hasAnyPermission(
      Permission.VOIR_RESERVATIONS,
      Permission.CREER_RESERVATION
    );
  }

  get canAccessRestaurant(): boolean {
    return this.hasAnyPermission(
      Permission.VOIR_COMMANDES,
      Permission.CREER_COMMANDE
    );
  }

  get canAccessStock(): boolean {
    return this.hasAnyPermission(
      Permission.VOIR_STOCK,
      Permission.MODIFIER_STOCK
    );
  }

  get canAccessFinances(): boolean {
    return this.hasAnyPermission(
      Permission.VOIR_COMPTABILITE,
      Permission.MODIFIER_COMPTABILITE
    );
  }

  get canAccessEmployes(): boolean {
    return this.hasAnyPermission(
      Permission.VOIR_EMPLOYES,
      Permission.GERER_EMPLOYES
    );
  }

  get canAccessConfiguration(): boolean {
    return this.hasAnyPermission(
      Permission.VOIR_CONFIGURATION,
      Permission.MODIFIER_CONFIGURATION
    );
  }

  get canManageEmployes(): boolean {
    return this.hasPermission(Permission.GERER_EMPLOYES);
  }

  get canModifyFinances(): boolean {
    return this.hasPermission(Permission.MODIFIER_COMPTABILITE);
  }

  get canModifyStock(): boolean {
    return this.hasPermission(Permission.MODIFIER_STOCK);
  }
}
