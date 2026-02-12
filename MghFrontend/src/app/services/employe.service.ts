import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { User, CreateUserRequest, UpdatePasswordRequest, Role } from '../models/employe.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeService {
  private apiUrl = `${environment.apiUrl}/users`;
  private rolesUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  // Créer un employé
  createUser(request: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, request);
  }

  // Obtenir un employé par ID
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  // Obtenir le profil de l'employé connecté
  getUserProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`);
  }

  // Obtenir tous les employés
  getUsers(includeInactive: boolean = false): Observable<ApiResponse<User[]>> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  // Rechercher des employés
  searchUsers(keyword: string): Observable<ApiResponse<User[]>> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/search`, { params });
  }

  // Mettre à jour un employé
  updateUser(id: number, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user);
  }

  // Mettre à jour les rôles d'un employé
  updateUserRoles(id: number, roleNames: string[]): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/roles`, roleNames);
  }

  // Changer le mot de passe
  changePassword(id: number, request: UpdatePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/password`, request);
  }

  // Activer/Désactiver un employé
  toggleStatus(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Obtenir tous les rôles disponibles
  getAllRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.rolesUrl);
  }
}