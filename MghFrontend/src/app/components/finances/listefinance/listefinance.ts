import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
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
  ModePaiement,
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
    ToolbarModule,
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
  
  // Statistiques
  statistiques: StatistiquesFinancieres | null = null;
  
  // Filtres
  searchTerm = '';
  selectedType: TypeTransaction | null = null;
  selectedStatut: StatutTransaction | null = null;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  
  // Options pour les filtres
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

  // Enums pour le template
  TypeTransaction = TypeTransaction;
  StatutTransaction = StatutTransaction;
  
  // Labels pour le template
  TYPE_LABELS = TYPE_TRANSACTION_LABELS;
  TYPE_COLORS = TYPE_TRANSACTION_COLORS;
  STATUT_LABELS = STATUT_TRANSACTION_LABELS;
  STATUT_COLORS = STATUT_TRANSACTION_COLORS;
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

  loadTransactions(): void {
    this.loading = true;
    
    const dateDebutStr = this.dateDebut ? this.formatDate(this.dateDebut) : undefined;
    const dateFinStr = this.dateFin ? this.formatDate(this.dateFin) : undefined;
    
    this.financeService.getTransactions(
      dateDebutStr,
      dateFinStr,
      this.selectedType || undefined,
      this.selectedStatut || undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.transactions = response.data;
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les transactions'
        });
        this.loading = false;
      }
    });
  }

  loadStatistiques(): void {
    this.financeService.getStatistiques().subscribe({
      next: (response) => {
        if (response.success) {
          this.statistiques = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques', error);
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredTransactions = this.transactions;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredTransactions = this.transactions.filter(t =>
      t.reference?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.categorie.toLowerCase().includes(term) ||
      t.fournisseurNom?.toLowerCase().includes(term)
    );
  }

  onFilterChange(): void {
    this.loadTransactions();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = null;
    this.selectedStatut = null;
    this.dateDebut = null;
    this.dateFin = null;
    this.loadTransactions();
  }

  viewDetails(transaction: Transaction): void {
    this.router.navigate(['/finances', transaction.id]);
  }

  editTransaction(transaction: Transaction): void {
    this.router.navigate(['/finances/edit', transaction.id]);
  }

  validerTransaction(transaction: Transaction): void {
    if (!transaction.id) return;

    this.confirmationService.confirm({
      message: `Voulez-vous valider cette transaction de ${transaction.montant} FCFA ?`,
      header: 'Confirmation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.financeService.validerTransaction(transaction.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Transaction validée avec succès'
              });
              this.loadTransactions();
              this.loadStatistiques();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de valider la transaction'
            });
          }
        });
      }
    });
  }

  annulerTransaction(transaction: Transaction): void {
    if (!transaction.id) return;

    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment annuler cette transaction ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.annulerTransaction(transaction.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Transaction annulée'
              });
              this.loadTransactions();
              this.loadStatistiques();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible d\'annuler la transaction'
            });
          }
        });
      }
    });
  }

  deleteTransaction(transaction: Transaction): void {
    if (!transaction.id) return;

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette transaction ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-trash',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.deleteTransaction(transaction.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Transaction supprimée'
              });
              this.loadTransactions();
              this.loadStatistiques();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer la transaction'
            });
          }
        });
      }
    });
  }

  exportPDF(): void {
    const dateDebutStr = this.dateDebut ? this.formatDate(this.dateDebut) : undefined;
    const dateFinStr = this.dateFin ? this.formatDate(this.dateFin) : undefined;
    
    this.financeService.exportTransactions('PDF', dateDebutStr, dateFinStr).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().getTime()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Export PDF généré'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de générer l\'export'
        });
      }
    });
  }

  exportExcel(): void {
    const dateDebutStr = this.dateDebut ? this.formatDate(this.dateDebut) : undefined;
    const dateFinStr = this.dateFin ? this.formatDate(this.dateFin) : undefined;
    
    this.financeService.exportTransactions('EXCEL', dateDebutStr, dateFinStr).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().getTime()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Export Excel généré'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de générer l\'export'
        });
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }

  formatDateTime(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }

  getTypeLabel(type: TypeTransaction): string {
    return this.TYPE_LABELS[type];
  }

  getStatutLabel(statut: StatutTransaction): string {
    return this.STATUT_LABELS[statut];
  }

  getModePaiementLabel(mode: ModePaiement): string {
    return this.MODE_PAIEMENT_LABELS[mode as ModePaiement];
  }

  getSeverity(type: TypeTransaction): 'success' | 'danger' {
    return TYPE_TRANSACTION_COLORS[type] as 'success' | 'danger';
  }

  getStatutSeverity(statut: StatutTransaction): 'success' | 'warn' | 'danger' | 'info' {
    const severity = STATUT_TRANSACTION_COLORS[statut];
    return severity === 'warning' ? 'warn' : severity as 'success' | 'warn' | 'danger' | 'info';
  }
}