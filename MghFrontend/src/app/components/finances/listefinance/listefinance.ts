import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Services
import { FinanceService } from '../../../services/finance.service';
import { MessageService, ConfirmationService } from 'primeng/api';

// Models
import {
  Transaction,
  StatistiquesFinancieres,
  TypeTransaction,
  StatutTransaction,
  ModePaiementTransaction,
  TYPE_TRANSACTION_LABELS,
  TYPE_TRANSACTION_COLORS,
  STATUT_TRANSACTION_LABELS,
  STATUT_TRANSACTION_COLORS,
  MODE_PAIEMENT_LABELS
} from '../../../models/finance.model';

@Component({
  selector: 'app-listefinance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './listefinance.html',
  styleUrl: './listefinance.css',
  providers: [MessageService, ConfirmationService]
})
export class Listefinance implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading = false;

  statistiques: StatistiquesFinancieres | null = null;

  // Filtres
  searchTerm = '';
  selectedType: TypeTransaction | null = null;
  selectedStatut: StatutTransaction | null = null;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  // Options
  typesTransaction = [
    { label: 'Tous', value: null },
    { label: TYPE_TRANSACTION_LABELS[TypeTransaction.REVENU], value: TypeTransaction.REVENU },
    { label: TYPE_TRANSACTION_LABELS[TypeTransaction.DEPENSE], value: TypeTransaction.DEPENSE }
  ];

  statutsTransaction = [
    { label: 'Tous', value: null },
    { label: STATUT_TRANSACTION_LABELS[StatutTransaction.EN_ATTENTE], value: StatutTransaction.EN_ATTENTE },
    { label: STATUT_TRANSACTION_LABELS[StatutTransaction.VALIDEE], value: StatutTransaction.VALIDEE },
    { label: STATUT_TRANSACTION_LABELS[StatutTransaction.ANNULEE], value: StatutTransaction.ANNULEE },
    { label: STATUT_TRANSACTION_LABELS[StatutTransaction.REMBOURSEE], value: StatutTransaction.REMBOURSEE }
  ];

  // Expose enums au template
  TypeTransaction = TypeTransaction;
  StatutTransaction = StatutTransaction;
  TYPE_LABELS = TYPE_TRANSACTION_LABELS;
  STATUT_LABELS = STATUT_TRANSACTION_LABELS;
  MODE_PAIEMENT_LABELS = MODE_PAIEMENT_LABELS;

  constructor(
    private financeService: FinanceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadStatistiques();
  }

  // ─── CHARGEMENT ────────────────────────────────────────────────────────────

  loadTransactions(): void {
    this.loading = true;
    this.financeService.getTransactions().subscribe({
      next: (response) => {
        if (response.success) {
          this.transactions = response.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error', summary: 'Erreur',
          detail: 'Impossible de charger les transactions'
        });
        this.loading = false;
      }
    });
  }

  loadStatistiques(): void {
    this.financeService.getStatistiques().subscribe({
      next: (response) => {
        if (response.success) this.statistiques = response.data;
      },
      error: (err) => console.error('Erreur stats:', err)
    });
  }

  // ─── FILTRES (côté client) ─────────────────────────────────────────────────

  applyFilter(): void { this.applyFilters(); }

  applyFilters(): void {
    let result = [...this.transactions];

    // Filtre texte
    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t =>
        t.reference?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.categorie?.toLowerCase().includes(term)
      );
    }

    // Filtre type
    if (this.selectedType) {
      result = result.filter(t => t.type === this.selectedType);
    }

    // Filtre statut
    if (this.selectedStatut) {
      result = result.filter(t => t.statut === this.selectedStatut);
    }

    // Filtre dates
    if (this.dateDebut) {
      const debut = this.dateDebut.getTime();
      result = result.filter(t => t.dateTransaction && new Date(t.dateTransaction).getTime() >= debut);
    }
    if (this.dateFin) {
      const fin = this.dateFin.getTime();
      result = result.filter(t => t.dateTransaction && new Date(t.dateTransaction).getTime() <= fin);
    }

    this.filteredTransactions = result;
  }

  /** Alias pour la liaison ngModel sur les selects */
  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = null;
    this.selectedStatut = null;
    this.dateDebut = null;
    this.dateFin = null;
    this.applyFilters();
  }

  // ─── NAVIGATION ────────────────────────────────────────────────────────────

  viewDetails(transaction: Transaction): void {
    this.router.navigate(['/finances', transaction.id]);
  }

  editTransaction(transaction: Transaction): void {
    this.router.navigate(['/finances/edit', transaction.id]);
  }

  // ─── ACTIONS ───────────────────────────────────────────────────────────────

  validerTransaction(transaction: Transaction): void {
    if (!transaction.id) return;
    this.confirmationService.confirm({
      message: `Voulez-vous valider cette transaction de ${this.formatCurrency(transaction.montant)} ?`,
      header: 'Confirmation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Oui', rejectLabel: 'Non',
      accept: () => {
        this.financeService.validerTransaction(transaction.id!).subscribe({
          next: (r) => {
            if (r.success) {
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Transaction validée' });
              this.loadTransactions();
              this.loadStatistiques();
            }
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de valider' })
        });
      }
    });
  }

  annulerTransaction(transaction: Transaction): void {
    if (!transaction.id) return;
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment annuler cette transaction ?',
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui', rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.annulerTransaction(transaction.id!).subscribe({
          next: (r) => {
            if (r.success) {
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Transaction annulée' });
              this.loadTransactions();
              this.loadStatistiques();
            }
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'annuler' })
        });
      }
    });
  }

  deleteTransaction(transaction: Transaction): void {
    if (!transaction.id) return;
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette transaction ?',
      header: 'Suppression', icon: 'pi pi-trash',
      acceptLabel: 'Oui', rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.deleteTransaction(transaction.id!).subscribe({
          next: (r) => {
            if (r.success) {
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Transaction supprimée' });
              this.loadTransactions();
              this.loadStatistiques();
            }
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer' })
        });
      }
    });
  }

  // ─── EXPORT ────────────────────────────────────────────────────────────────

  exportPDF(): void {
    this.financeService.exportTransactions(
      'PDF',
      this.dateDebut ? this.formatDateParam(this.dateDebut) : undefined,
      this.dateFin ? this.formatDateParam(this.dateFin) : undefined
    ).subscribe({
      next: (blob) => this.downloadBlob(blob, 'transactions.pdf'),
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Export échoué' })
    });
  }

  exportExcel(): void {
    this.financeService.exportTransactions(
      'EXCEL',
      this.dateDebut ? this.formatDateParam(this.dateDebut) : undefined,
      this.dateFin ? this.formatDateParam(this.dateFin) : undefined
    ).subscribe({
      next: (blob) => this.downloadBlob(blob, 'transactions.xlsx'),
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Export échoué' })
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
  }

  // ─── FORMATAGE ─────────────────────────────────────────────────────────────

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }

  formatDateTime(date: string | Date | undefined): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(date));
  }

  private formatDateParam(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getTypeLabel(type: TypeTransaction): string {
    return TYPE_TRANSACTION_LABELS[type] ?? type;
  }

  getStatutLabel(statut: StatutTransaction): string {
    return STATUT_TRANSACTION_LABELS[statut] ?? statut;
  }

  getModePaiementLabel(mode: string): string {
    return MODE_PAIEMENT_LABELS[mode as ModePaiementTransaction] ?? mode;
  }

  getSeverity(type: TypeTransaction): 'success' | 'danger' {
    return TYPE_TRANSACTION_COLORS[type] as 'success' | 'danger';
  }

  getStatutSeverity(statut: StatutTransaction): 'success' | 'warn' | 'danger' | 'info' {
    const s = STATUT_TRANSACTION_COLORS[statut];
    return s === 'warning' ? 'warn' : s as any;
  }
}
