import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { CommandeRestaurant, StatutCommandeRestaurant, ProduitMenu} from '../models/restaurant.model';
import { TypeProduit } from '../models/produit.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl    = `${environment.apiUrl}/commandes-restaurant`;
  private produitsUrl = `${environment.apiUrl}/produits`;  // Produits du stock = menu restaurant

  constructor(private http: HttpClient) {}

  // ========== COMMANDES RESTAURANT ==========

  /** Créer une commande */
  createCommande(commande: CommandeRestaurant): Observable<ApiResponse<CommandeRestaurant>> {
    return this.http.post<ApiResponse<CommandeRestaurant>>(this.apiUrl, commande);
  }

  /** Obtenir toutes les commandes */
  getCommandes(): Observable<ApiResponse<CommandeRestaurant[]>> {
    return this.http.get<ApiResponse<CommandeRestaurant[]>>(this.apiUrl);
  }

  /** Obtenir une commande par ID */
  getCommandeById(id: number): Observable<ApiResponse<CommandeRestaurant>> {
    return this.http.get<ApiResponse<CommandeRestaurant>>(`${this.apiUrl}/${id}`);
  }

  /** Obtenir les commandes par statut */
  getCommandesByStatut(statut: StatutCommandeRestaurant): Observable<ApiResponse<CommandeRestaurant[]>> {
    return this.http.get<ApiResponse<CommandeRestaurant[]>>(`${this.apiUrl}/statut/${statut}`);
  }

  /** Mettre à jour le statut d'une commande */
  updateStatut(id: number, statut: StatutCommandeRestaurant): Observable<ApiResponse<CommandeRestaurant>> {
    const params = new HttpParams().set('statut', statut);
    return this.http.put<ApiResponse<CommandeRestaurant>>(`${this.apiUrl}/${id}/statut`, {}, { params });
  }

  /** Ajouter un paiement */
  addPaiement(id: number, montant: number): Observable<ApiResponse<CommandeRestaurant>> {
    const params = new HttpParams().set('montant', montant.toString());
    return this.http.post<ApiResponse<CommandeRestaurant>>(`${this.apiUrl}/${id}/paiement`, {}, { params });
  }

  // ========== MENU RESTAURANT (= produits du stock) ==========

  /**
   * Menu complet : tous les produits disponibles (typeProduit ENTREE/PLAT/DESSERT/BOISSON/AUTRE)
   * → GET /api/produits/menu
   */
  getProduitsDisponibles(): Observable<ApiResponse<ProduitMenu[]>> {
    return this.http.get<ApiResponse<ProduitMenu[]>>(`${this.produitsUrl}/menu`);
  }

  /**
   * Menu filtré par type de produit
   * → GET /api/produits/menu/{type}
   * Ex: /api/produits/menu/BOISSON
   */
  getMenuParType(type: TypeProduit): Observable<ApiResponse<ProduitMenu[]>> {
    return this.http.get<ApiResponse<ProduitMenu[]>>(`${this.produitsUrl}/menu/${type}`);
  }
}
