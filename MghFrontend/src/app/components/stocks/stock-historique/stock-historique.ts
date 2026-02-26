import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Services et modèles
import { StockService } from '../../../services/stock.service';
import {
  MouvementStock,
  TypeMouvement,
  TYPE_MOUVEMENT_LABELS
} from '../../../models/produit.model';

type Severity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-stock-historique',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    SelectModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './stock-historique.html',
  styleUrl: './stock-historique.css'
})
export class StockHistorique implements OnInit {

  mouvements: MouvementStock[] = [];
  mouvementsFiltered: MouvementStock[] = [];
  loading = false;

  // Filtres
  searchValue = '';
  filtreType: TypeMouvement | null = null;
  filtreProduitId: number | null = null;

  // Options pour les selects
  typesOptions = [
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.ENTREE],     value: TypeMouvement.ENTREE },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.SORTIE],     value: TypeMouvement.SORTIE },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.AJUSTEMENT], value: TypeMouvement.AJUSTEMENT },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.RETOUR],     value: TypeMouvement.RETOUR },
  ];

  produitsOptions: { label: string; value: number }[] = [];

  // Statistiques
  totalMouvements = 0;
  totalEntrees = 0;
  totalSorties = 0;
  totalAjustements = 0;

  constructor(
    private stockService: StockService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadHistorique();
  }

  // ─────────────────────────────────────────────────────────────
  // Chargement
  // ─────────────────────────────────────────────────────────────

  loadHistorique(): void {
    this.loading = true;
    this.stockService.getHistorique().subscribe({
      next: (response) => {
        if (response.success) {
          this.mouvements = response.data;
          this.mouvementsFiltered = response.data;
          this.buildProduitsOptions();
          this.calculateStats();
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Impossible de charger l\'historique'
        });
        this.loading = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Filtres
  // ─────────────────────────────────────────────────────────────

  applyFilters(): void {
    let result = [...this.mouvements];

    if (this.searchValue.trim()) {
      const s = this.searchValue.toLowerCase();
      result = result.filter(m =>
        m.produitNom?.toLowerCase().includes(s) ||
        m.produitCode?.toLowerCase().includes(s) ||
        m.motif?.toLowerCase().includes(s) ||
        m.userNom?.toLowerCase().includes(s)
      );
    }

    if (this.filtreType) {
      result = result.filter(m => m.type === this.filtreType);
    }

    if (this.filtreProduitId) {
      result = result.filter(m => m.produitId === this.filtreProduitId);
    }

    this.mouvementsFiltered = result;
  }

  resetFilters(): void {
    this.searchValue = '';
    this.filtreType = null;
    this.filtreProduitId = null;
    this.mouvementsFiltered = [...this.mouvements];
  }

  // ─────────────────────────────────────────────────────────────
  // Statistiques
  // ─────────────────────────────────────────────────────────────

  calculateStats(): void {
    this.totalMouvements  = this.mouvements.length;
    this.totalEntrees     = this.mouvements.filter(m => m.type === TypeMouvement.ENTREE).length;
    this.totalSorties     = this.mouvements.filter(m => m.type === TypeMouvement.SORTIE).length;
    this.totalAjustements = this.mouvements.filter(
      m => m.type === TypeMouvement.AJUSTEMENT || m.type === TypeMouvement.RETOUR
    ).length;
  }

  buildProduitsOptions(): void {
    const seen = new Set<number>();
    this.produitsOptions = this.mouvements
      .filter(m => m.produitId && !seen.has(m.produitId!) && seen.add(m.produitId!))
      .map(m => ({ label: `${m.produitNom} (${m.produitCode})`, value: m.produitId! }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers template
  // ─────────────────────────────────────────────────────────────

  getTypeLabel(type: TypeMouvement): string {
    return TYPE_MOUVEMENT_LABELS[type] ?? type;
  }

  getTypeSeverity(type: TypeMouvement): Severity {
    switch (type) {
      case TypeMouvement.ENTREE:     return 'success';
      case TypeMouvement.SORTIE:     return 'danger';
      case TypeMouvement.AJUSTEMENT: return 'warn';
      case TypeMouvement.RETOUR:     return 'info';
      default: return 'secondary';
    }
  }

  getTypeIcon(type: TypeMouvement): string {
    switch (type) {
      case TypeMouvement.ENTREE:     return 'pi pi-arrow-down';
      case TypeMouvement.SORTIE:     return 'pi pi-arrow-up';
      case TypeMouvement.AJUSTEMENT: return 'pi pi-refresh';
      case TypeMouvement.RETOUR:     return 'pi pi-reply';
      default: return 'pi pi-circle';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  formatHeure(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  getInitiales(nom: string): string {
    return nom
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  goToStock(): void {
    this.router.navigate(['/stocks']);
  }
}
