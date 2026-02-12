import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { Hotel, HotelFilter } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = `${environment.apiUrl}/api/hotels`;
  private hotelsSubject = new BehaviorSubject<Hotel[]>([]);
  public hotels$ = this.hotelsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les hôtels avec filtres optionnels
   */
  getHotels(filters?: HotelFilter): Observable<Hotel[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.ville) params = params.set('ville', filters.ville);
      if (filters.pays) params = params.set('pays', filters.pays);
      if (filters.nombre_etoiles) params = params.set('nombre_etoiles', filters.nombre_etoiles.toString());
      if (filters.prix_min) params = params.set('prix_min', filters.prix_min.toString());
      if (filters.prix_max) params = params.set('prix_max', filters.prix_max.toString());
      if (filters.capacite_min) params = params.set('capacite_min', filters.capacite_min.toString());
      if (filters.disponible !== undefined) params = params.set('disponible', filters.disponible.toString());
      if (filters.equipements && filters.equipements.length > 0) {
        params = params.set('equipements', filters.equipements.join(','));
      }
    }

    return this.http.get<Hotel[]>(this.apiUrl + '/', { params }).pipe(
      tap(hotels => this.hotelsSubject.next(hotels)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère un hôtel par son ID
   */
  getHotel(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crée un nouvel hôtel
   */
  createHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(this.apiUrl + '/', hotel).pipe(
      tap(newHotel => {
        const currentHotels = this.hotelsSubject.value;
        this.hotelsSubject.next([...currentHotels, newHotel]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour un hôtel existant
   */
  updateHotel(id: number, hotel: Partial<Hotel>): Observable<Hotel> {
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/`, hotel).pipe(
      tap(updatedHotel => {
        const currentHotels = this.hotelsSubject.value;
        const index = currentHotels.findIndex(h => h.id === id);
        if (index !== -1) {
          currentHotels[index] = updatedHotel;
          this.hotelsSubject.next([...currentHotels]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Supprime un hôtel
   */
  deleteHotel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      tap(() => {
        const currentHotels = this.hotelsSubject.value;
        this.hotelsSubject.next(currentHotels.filter(h => h.id !== id));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Upload d'image principale pour un hôtel
   */
  uploadImagePrincipale(id: number, file: File): Observable<Hotel> {
    const formData = new FormData();
    formData.append('image_principale', file);

    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload d'images secondaires pour un hôtel
   */
  uploadImagesSecondaires(id: number, files: File[]): Observable<Hotel> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    return this.http.post<Hotel>(`${this.apiUrl}/${id}/upload-images/`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les hôtels d'une ville spécifique
   */
  getHotelsByVille(ville: string): Observable<Hotel[]> {
    return this.getHotels({ ville });
  }

  /**
   * Récupère les hôtels par nombre d'étoiles
   */
  getHotelsByEtoiles(etoiles: number): Observable<Hotel[]> {
    return this.getHotels({ nombre_etoiles: etoiles });
  }

  /**
   * Recherche d'hôtels
   */
  searchHotels(query: string): Observable<Hotel[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<Hotel[]>(`${this.apiUrl}/search/`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les statistiques d'un hôtel
   */
  getHotelStats(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/stats/`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;

      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.detail) {
          errorMessage = error.error.detail;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
