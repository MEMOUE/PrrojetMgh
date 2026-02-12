import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Client } from '../models/client.model ';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  // Créer un client
  createClient(client: Client): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(this.apiUrl, client);
  }

  // Obtenir un client par ID
  getClientById(id: number): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/${id}`);
  }

  // Obtenir tous les clients de l'hôtel
  getClients(): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(this.apiUrl);
  }

  // Obtenir un client par email
  getClientByEmail(email: string): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/email/${email}`);
  }

  // Obtenir un client par téléphone
  getClientByTelephone(telephone: string): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/telephone/${telephone}`);
  }

  // Rechercher des clients
  searchClients(keyword: string): Observable<ApiResponse<Client[]>> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ApiResponse<Client[]>>(`${this.apiUrl}/search`, { params });
  }

  // Obtenir les clients fidèles
  getClientsFideles(minReservations: number = 3): Observable<ApiResponse<Client[]>> {
    const params = new HttpParams().set('minReservations', minReservations.toString());
    return this.http.get<ApiResponse<Client[]>>(`${this.apiUrl}/fideles`, { params });
  }

  // Mettre à jour un client
  updateClient(id: number, client: Partial<Client>): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(`${this.apiUrl}/${id}`, client);
  }

  // Supprimer un client
  deleteClient(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}