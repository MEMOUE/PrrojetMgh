import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Produit, MouvementStock, TypeMouvement, Fournisseur } from '../models/produit.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl        = `${environment.apiUrl}/produits`;
  private fournisseurUrl = `${environment.apiUrl}/fournisseurs`;
  private mouvementsUrl  = `${environment.apiUrl}/mouvements-stock`;

  constructor(private http: HttpClient) {}

  // ========== GESTION DES PRODUITS ==========

  createProduit(produit: Produit): Observable<ApiResponse<Produit>> {
    return this.http.post<ApiResponse<Produit>>(this.apiUrl, produit);
  }

  getProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(this.apiUrl);
  }

  getProduitById(id: number): Observable<ApiResponse<Produit>> {
    return this.http.get<ApiResponse<Produit>>(`${this.apiUrl}/${id}`);
  }

  getProduitsEnRupture(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/rupture`);
  }

  updateProduit(id: number, produit: Partial<Produit>): Observable<ApiResponse<Produit>> {
    return this.http.put<ApiResponse<Produit>>(`${this.apiUrl}/${id}`, produit);
  }

  deleteProduit(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  ajusterStock(
    id: number,
    quantite: number,
    type: TypeMouvement,
    motif?: string
  ): Observable<ApiResponse<void>> {
    let params = new HttpParams()
      .set('quantite', quantite.toString())
      .set('type', type);
    if (motif) params = params.set('motif', motif);
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/${id}/ajuster-stock`, {}, { params }
    );
  }

  // ========== HISTORIQUE DES MOUVEMENTS ==========

  /**
   * Historique complet des mouvements de l'hôtel
   * GET /api/mouvements-stock
   */
  getHistorique(): Observable<ApiResponse<MouvementStock[]>> {
    return this.http.get<ApiResponse<MouvementStock[]>>(this.mouvementsUrl);
  }

  /**
   * Historique des mouvements d'un produit spécifique
   * GET /api/mouvements-stock/produit/{produitId}
   */
  getHistoriqueProduit(produitId: number): Observable<ApiResponse<MouvementStock[]>> {
    return this.http.get<ApiResponse<MouvementStock[]>>(
      `${this.mouvementsUrl}/produit/${produitId}`
    );
  }

  // ========== GESTION DES FOURNISSEURS ==========

  getFournisseurs(): Observable<ApiResponse<Fournisseur[]>> {
    return this.http.get<ApiResponse<Fournisseur[]>>(this.fournisseurUrl);
  }

  getFournisseursActifs(): Observable<ApiResponse<Fournisseur[]>> {
    return this.http.get<ApiResponse<Fournisseur[]>>(`${this.fournisseurUrl}/actifs`);
  }

  createFournisseur(fournisseur: Fournisseur): Observable<ApiResponse<Fournisseur>> {
    return this.http.post<ApiResponse<Fournisseur>>(this.fournisseurUrl, fournisseur);
  }

  updateFournisseur(id: number, fournisseur: Partial<Fournisseur>): Observable<ApiResponse<Fournisseur>> {
    return this.http.put<ApiResponse<Fournisseur>>(`${this.fournisseurUrl}/${id}`, fournisseur);
  }

  deleteFournisseur(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.fournisseurUrl}/${id}`);
  }
}
