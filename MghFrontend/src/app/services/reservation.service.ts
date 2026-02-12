import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Reservation, CreateReservationRequest, StatutReservation } from '../models/reservation.model ';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  // Créer une réservation
  createReservation(request: CreateReservationRequest): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(this.apiUrl, request);
  }

  // Obtenir toutes les réservations
  getAllReservations(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(this.apiUrl);
  }

  // Obtenir une réservation par ID
  getReservationById(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.get<ApiResponse<Reservation>>(`${this.apiUrl}/${id}`);
  }

  // Obtenir une réservation par numéro
  getReservationByNumero(numero: string): Observable<ApiResponse<Reservation>> {
    return this.http.get<ApiResponse<Reservation>>(`${this.apiUrl}/numero/${numero}`);
  }

  // Obtenir les réservations par statut
  getReservationsByStatut(statut: StatutReservation): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/statut/${statut}`);
  }

  // Obtenir les réservations d'un client
  getReservationsByClient(clientId: number): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/client/${clientId}`);
  }

  // Obtenir les arrivées du jour
  getArriveesAujourdhui(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/arrivees-aujourdhui`);
  }

  // Obtenir les départs du jour
  getDepartsAujourdhui(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/departs-aujourdhui`);
  }

  // Obtenir les réservations en cours
  getReservationsEnCours(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/en-cours`);
  }

  // Obtenir les réservations à venir
  getReservationsAVenir(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/a-venir`);
  }

  // Rechercher des réservations
  searchReservations(keyword: string): Observable<ApiResponse<Reservation[]>> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/search`, { params });
  }

  // Mettre à jour une réservation
  updateReservation(id: number, reservation: Partial<Reservation>): Observable<ApiResponse<Reservation>> {
    return this.http.put<ApiResponse<Reservation>>(`${this.apiUrl}/${id}`, reservation);
  }

  // Check-in
  doCheckin(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/checkin`, {});
  }

  // Check-out
  doCheckout(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/checkout`, {});
  }

  // Annuler une réservation
  cancelReservation(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  addPaiement(reservationId: number, paiementData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/${reservationId}/paiements`, paiementData);
}

}