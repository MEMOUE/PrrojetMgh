import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { CommandeRestaurant, StatutCommandeRestaurant, ProduitMenu } from '../models/restaurant.model ';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = `${environment.apiUrl}/commandes-restaurant`;
  private menuUrl = `${environment.apiUrl}/produits-menu`;

  constructor(private http: HttpClient) {}

  // ========== COMMANDES RESTAURANT ==========

  // Créer une commande
  createCommande(commande: CommandeRestaurant): Observable<ApiResponse<CommandeRestaurant>> {
    return this.http.post<ApiResponse<CommandeRestaurant>>(this.apiUrl, commande);
  }

  // Obtenir toutes les commandes
  getCommandes(): Observable<ApiResponse<CommandeRestaurant[]>> {
    return this.http.get<ApiResponse<CommandeRestaurant[]>>(this.apiUrl);
  }

  // Obtenir une commande par ID
  getCommandeById(id: number): Observable<ApiResponse<CommandeRestaurant>> {
    return this.http.get<ApiResponse<CommandeRestaurant>>(`${this.apiUrl}/${id}`);
  }

  // Obtenir les commandes par statut
  getCommandesByStatut(statut: StatutCommandeRestaurant): Observable<ApiResponse<CommandeRestaurant[]>> {
    return this.http.get<ApiResponse<CommandeRestaurant[]>>(`${this.apiUrl}/statut/${statut}`);
  }

  // Mettre à jour le statut d'une commande
  updateStatut(id: number, statut: StatutCommandeRestaurant): Observable<ApiResponse<CommandeRestaurant>> {
    const params = new HttpParams().set('statut', statut);
    return this.http.put<ApiResponse<CommandeRestaurant>>(`${this.apiUrl}/${id}/statut`, {}, { params });
  }

  // Ajouter un paiement
  addPaiement(id: number, montant: number): Observable<ApiResponse<CommandeRestaurant>> {
    const params = new HttpParams().set('montant', montant.toString());
    return this.http.post<ApiResponse<CommandeRestaurant>>(`${this.apiUrl}/${id}/paiement`, {}, { params });
  }

  // ========== PRODUITS MENU ==========

  // Obtenir tous les produits du menu
  getProduitsMenu(): Observable<ApiResponse<ProduitMenu[]>> {
    return this.http.get<ApiResponse<ProduitMenu[]>>(this.menuUrl);
  }

  // Obtenir les produits disponibles
  getProduitsDisponibles(): Observable<ApiResponse<ProduitMenu[]>> {
    return this.http.get<ApiResponse<ProduitMenu[]>>(`${this.menuUrl}/disponibles`);
  }

  // Obtenir les produits par catégorie
  getProduitsByCategorie(categorie: string): Observable<ApiResponse<ProduitMenu[]>> {
    return this.http.get<ApiResponse<ProduitMenu[]>>(`${this.menuUrl}/categorie/${categorie}`);
  }

  // Créer un produit menu
  createProduitMenu(produit: ProduitMenu): Observable<ApiResponse<ProduitMenu>> {
    return this.http.post<ApiResponse<ProduitMenu>>(this.menuUrl, produit);
  }

  // Mettre à jour un produit menu
  updateProduitMenu(id: number, produit: ProduitMenu): Observable<ApiResponse<ProduitMenu>> {
    return this.http.put<ApiResponse<ProduitMenu>>(`${this.menuUrl}/${id}`, produit);
  }

  // Supprimer un produit menu
  deleteProduitMenu(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.menuUrl}/${id}`);
  }
}