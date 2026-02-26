import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import {
  Transaction,
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
  private baseUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  // ─── TRANSACTIONS ──────────────────────────────────────────────────────────

  /** Créer une transaction */
  createTransaction(transaction: Transaction): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(this.baseUrl, transaction);
  }

  /** Liste complète des transactions de l'hôtel */
  getTransactions(
    dateDebut?: string,
    dateFin?: string,
    type?: TypeTransaction,
    statut?: StatutTransaction
  ): Observable<ApiResponse<Transaction[]>> {
    // Le filtrage date/type/statut est fait côté frontend (le backend retourne tout)
    return this.http.get<ApiResponse<Transaction[]>>(this.baseUrl);
  }

  /** Transaction par ID */
  getTransactionById(id: number): Observable<ApiResponse<Transaction>> {
    return this.http.get<ApiResponse<Transaction>>(`${this.baseUrl}/${id}`);
  }

  /** Transactions par type */
  getTransactionsByType(type: TypeTransaction): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.baseUrl}/type/${type}`);
  }

  /** Transactions en attente */
  getTransactionsEnAttente(): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.baseUrl}/en-attente`);
  }

  /** Recherche de transactions */
  searchTransactions(keyword: string): Observable<ApiResponse<Transaction[]>> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ApiResponse<Transaction[]>>(`${this.baseUrl}/search`, { params });
  }

  /** Mettre à jour une transaction */
  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<ApiResponse<Transaction>> {
    return this.http.put<ApiResponse<Transaction>>(`${this.baseUrl}/${id}`, transaction);
  }

  /** Valider une transaction */
  validerTransaction(id: number): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.baseUrl}/${id}/valider`, {});
  }

  /** Annuler une transaction */
  annulerTransaction(id: number, motif?: string): Observable<ApiResponse<Transaction>> {
    const params = motif ? new HttpParams().set('motif', motif) : new HttpParams();
    return this.http.post<ApiResponse<Transaction>>(
      `${this.baseUrl}/${id}/annuler`, {}, { params });
  }

  /** Supprimer une transaction */
  deleteTransaction(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // ─── STATISTIQUES ──────────────────────────────────────────────────────────

  /** Statistiques financières */
  getStatistiques(): Observable<ApiResponse<StatistiquesFinancieres>> {
    return this.http.get<ApiResponse<StatistiquesFinancieres>>(`${this.baseUrl}/statistiques`);
  }

  // ─── EXPORT ────────────────────────────────────────────────────────────────

  /** Export PDF ou Excel */
  exportTransactions(
    format: 'PDF' | 'EXCEL',
    dateDebut?: string,
    dateFin?: string
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }
}
