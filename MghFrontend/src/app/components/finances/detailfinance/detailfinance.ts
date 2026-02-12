import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';

// Services
import { FinanceService } from '../../../services/finance.service';
import { MessageService, ConfirmationService } from 'primeng/api';

// Models
import { 
  Transaction,
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
  selector: 'app-detailfinance',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule
  ],
  templateUrl: './detailfinance.html',
  styleUrl: './detailfinance.css',
  providers: [MessageService, ConfirmationService]
})
export class Detailfinance implements OnInit {
  transaction: Transaction | null = null;
  loading = false;
  transactionId: number | null = null;

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
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.transactionId = +params['id'];
      if (this.transactionId) {
        this.loadTransaction();
      }
    });
  }

  loadTransaction(): void {
    if (!this.transactionId) return;

    this.loading = true;
    this.financeService.getTransactionById(this.transactionId).subscribe({
      next: (response) => {
        if (response.success) {
          this.transaction = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger la transaction'
        });
        this.loading = false;
        this.router.navigate(['/finances']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/finances']);
  }

  editTransaction(): void {
    if (this.transaction?.id) {
      this.router.navigate(['/finances/edit', this.transaction.id]);
    }
  }

  validerTransaction(): void {
    if (!this.transaction?.id) return;

    this.confirmationService.confirm({
      message: `Voulez-vous valider cette transaction de ${this.transaction.montant} FCFA ?`,
      header: 'Confirmation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.financeService.validerTransaction(this.transaction!.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Transaction validée avec succès'
              });
              this.loadTransaction();
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

  annulerTransaction(): void {
    if (!this.transaction?.id) return;

    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment annuler cette transaction ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.annulerTransaction(this.transaction!.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Transaction annulée'
              });
              this.loadTransaction();
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

  deleteTransaction(): void {
    if (!this.transaction?.id) return;

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette transaction ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-trash',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeService.deleteTransaction(this.transaction!.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Transaction supprimée'
              });
              this.router.navigate(['/finances']);
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

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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