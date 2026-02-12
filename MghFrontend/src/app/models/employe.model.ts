// ===============================
// MODELS POUR LES EMPLOYÉS (USERS)
// Compatible avec le backend Spring Boot
// ===============================

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  active?: boolean;
  hotelId?: number;
  hotelName?: string;
  roleNames?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  roleNames: string[];
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface Role {
  id?: number;
  name: string;
  description?: string;
  permissions?: string[];
}

// Labels pour les rôles
export const ROLE_LABELS: Record<string, string> = {
  'RECEPTION': 'Réception',
  'RESTAURANT': 'Restaurant',
  'ECONOMAT': 'Économat',
  'COMPTABLE': 'Comptable',
  'MANAGER': 'Manager'
};

// Couleurs pour les rôles
export const ROLE_COLORS: Record<string, string> = {
  'RECEPTION': 'primary',
  'RESTAURANT': 'warning',
  'ECONOMAT': 'info',
  'COMPTABLE': 'success',
  'MANAGER': 'danger'
};

// Liste des rôles disponibles
export const AVAILABLE_ROLES = [
  { name: 'RECEPTION', label: 'Réception' },
  { name: 'RESTAURANT', label: 'Restaurant' },
  { name: 'ECONOMAT', label: 'Économat' },
  { name: 'COMPTABLE', label: 'Comptable' },
  { name: 'MANAGER', label: 'Manager' }
];