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
  private apiUrl = `${environment.apiUrl}/produits`;
  private fournisseurUrl = `${environment.apiUrl}/fournisseurs`;

  constructor(private http: HttpClient) {}

  // ========== GESTION DES PRODUITS ==========

  /**
   * Créer un produit
   */
  createProduit(produit: Produit): Observable<ApiResponse<Produit>> {
    return this.http.post<ApiResponse<Produit>>(this.apiUrl, produit);
  }

  /**
   * Obtenir tous les produits
   */
  getProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(this.apiUrl);
  }

  /**
   * Obtenir un produit par ID
   */
  getProduitById(id: number): Observable<ApiResponse<Produit>> {
    return this.http.get<ApiResponse<Produit>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtenir les produits en rupture de stock
   */
  getProduitsEnRupture(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/rupture`);
  }

  /**
   * Mettre à jour un produit
   */
  updateProduit(id: number, produit: Partial<Produit>): Observable<ApiResponse<Produit>> {
    return this.http.put<ApiResponse<Produit>>(`${this.apiUrl}/${id}`, produit);
  }

  /**
   * Supprimer un produit
   */
  deleteProduit(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Ajuster le stock d'un produit
   */
  ajusterStock(
    id: number,
    quantite: number,
    type: TypeMouvement,
    motif?: string
  ): Observable<ApiResponse<void>> {
    let params = new HttpParams()
      .set('quantite', quantite.toString())
      .set('type', type);
    
    if (motif) {
      params = params.set('motif', motif);
    }

    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/${id}/ajuster-stock`,
      {},
      { params }
    );
  }

  // ========== GESTION DES FOURNISSEURS ==========

  /**
   * Obtenir tous les fournisseurs
   */
  getFournisseurs(): Observable<ApiResponse<Fournisseur[]>> {
    return this.http.get<ApiResponse<Fournisseur[]>>(this.fournisseurUrl);
  }

  /**
   * Obtenir les fournisseurs actifs
   */
  getFournisseursActifs(): Observable<ApiResponse<Fournisseur[]>> {
    return this.http.get<ApiResponse<Fournisseur[]>>(`${this.fournisseurUrl}/actifs`);
  }

  /**
   * Créer un fournisseur
   */
  createFournisseur(fournisseur: Fournisseur): Observable<ApiResponse<Fournisseur>> {
    return this.http.post<ApiResponse<Fournisseur>>(this.fournisseurUrl, fournisseur);
  }

  /**
   * Mettre à jour un fournisseur
   */
  updateFournisseur(id: number, fournisseur: Partial<Fournisseur>): Observable<ApiResponse<Fournisseur>> {
    return this.http.put<ApiResponse<Fournisseur>>(`${this.fournisseurUrl}/${id}`, fournisseur);
  }

  /**
   * Supprimer un fournisseur
   */
  deleteFournisseur(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.fournisseurUrl}/${id}`);
  }
}