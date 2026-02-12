import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { 
  Transaction, 
  CategorieFinanciere, 
  RapportFinancier, 
  StatistiquesFinancieres,
  TypeTransaction,
  StatutTransaction 
} from '../models/finance.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private transactionsUrl = `${environment.apiUrl}/transactions`;
  private categoriesUrl = `${environment.apiUrl}/categories-financieres`;
  private rapportsUrl = `${environment.apiUrl}/rapports-financiers`;

  constructor(private http: HttpClient) {}

  // ========== TRANSACTIONS ==========

  // Créer une transaction
  createTransaction(transaction: Transaction): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(this.transactionsUrl, transaction);
  }

  // Obtenir toutes les transactions
  getTransactions(
    dateDebut?: string,
    dateFin?: string,
    type?: TypeTransaction,
    statut?: StatutTransaction
  ): Observable<ApiResponse<Transaction[]>> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    if (type) params = params.set('type', type);
    if (statut) params = params.set('statut', statut);

    return this.http.get<ApiResponse<Transaction[]>>(this.transactionsUrl, { params });
  }

  // Obtenir une transaction par ID
  getTransactionById(id: number): Observable<ApiResponse<Transaction>> {
    return this.http.get<ApiResponse<Transaction>>(`${this.transactionsUrl}/${id}`);
  }

  // Obtenir les transactions par type
  getTransactionsByType(type: TypeTransaction): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.transactionsUrl}/type/${type}`);
  }

  // Obtenir les transactions par catégorie
  getTransactionsByCategorie(categorie: string): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.transactionsUrl}/categorie/${categorie}`);
  }

  // Obtenir les transactions en attente
  getTransactionsEnAttente(): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.transactionsUrl}/en-attente`);
  }

  // Mettre à jour une transaction
  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<ApiResponse<Transaction>> {
    return this.http.put<ApiResponse<Transaction>>(`${this.transactionsUrl}/${id}`, transaction);
  }

  // Valider une transaction
  validerTransaction(id: number): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.transactionsUrl}/${id}/valider`, {});
  }

  // Annuler une transaction
  annulerTransaction(id: number, motif?: string): Observable<ApiResponse<Transaction>> {
    const params = motif ? new HttpParams().set('motif', motif) : new HttpParams();
    return this.http.post<ApiResponse<Transaction>>(`${this.transactionsUrl}/${id}/annuler`, {}, { params });
  }

  // Supprimer une transaction
  deleteTransaction(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.transactionsUrl}/${id}`);
  }

  // Rechercher des transactions
  searchTransactions(keyword: string): Observable<ApiResponse<Transaction[]>> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ApiResponse<Transaction[]>>(`${this.transactionsUrl}/search`, { params });
  }

  // ========== CATÉGORIES FINANCIÈRES ==========

  // Créer une catégorie
  createCategorie(categorie: CategorieFinanciere): Observable<ApiResponse<CategorieFinanciere>> {
    return this.http.post<ApiResponse<CategorieFinanciere>>(this.categoriesUrl, categorie);
  }

  // Obtenir toutes les catégories
  getCategories(): Observable<ApiResponse<CategorieFinanciere[]>> {
    return this.http.get<ApiResponse<CategorieFinanciere[]>>(this.categoriesUrl);
  }

  // Obtenir les catégories actives
  getCategoriesActives(): Observable<ApiResponse<CategorieFinanciere[]>> {
    return this.http.get<ApiResponse<CategorieFinanciere[]>>(`${this.categoriesUrl}/actives`);
  }

  // Obtenir les catégories par type
  getCategoriesByType(type: TypeTransaction): Observable<ApiResponse<CategorieFinanciere[]>> {
    return this.http.get<ApiResponse<CategorieFinanciere[]>>(`${this.categoriesUrl}/type/${type}`);
  }

  // Mettre à jour une catégorie
  updateCategorie(id: number, categorie: Partial<CategorieFinanciere>): Observable<ApiResponse<CategorieFinanciere>> {
    return this.http.put<ApiResponse<CategorieFinanciere>>(`${this.categoriesUrl}/${id}`, categorie);
  }

  // Supprimer une catégorie
  deleteCategorie(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.categoriesUrl}/${id}`);
  }

  // ========== STATISTIQUES & RAPPORTS ==========

  // Obtenir les statistiques financières
  getStatistiques(): Observable<ApiResponse<StatistiquesFinancieres>> {
    return this.http.get<ApiResponse<StatistiquesFinancieres>>(`${this.transactionsUrl}/statistiques`);
  }

  // Obtenir un rapport financier
  getRapport(dateDebut: string, dateFin: string): Observable<ApiResponse<RapportFinancier>> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<ApiResponse<RapportFinancier>>(this.rapportsUrl, { params });
  }

  // Obtenir le rapport mensuel
  getRapportMensuel(annee: number, mois: number): Observable<ApiResponse<RapportFinancier>> {
    return this.http.get<ApiResponse<RapportFinancier>>(
      `${this.rapportsUrl}/mensuel/${annee}/${mois}`
    );
  }

  // Obtenir le rapport annuel
  getRapportAnnuel(annee: number): Observable<ApiResponse<RapportFinancier>> {
    return this.http.get<ApiResponse<RapportFinancier>>(`${this.rapportsUrl}/annuel/${annee}`);
  }

  // Exporter les transactions
  exportTransactions(
    format: 'PDF' | 'EXCEL',
    dateDebut?: string,
    dateFin?: string
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get(`${this.transactionsUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}