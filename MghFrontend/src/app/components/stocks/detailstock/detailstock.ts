import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services et modèles
import { StockService } from '../../../services/stock.service';
import { Produit, TYPE_MOUVEMENT_LABELS, TYPE_MOUVEMENT_COLORS } from '../../../models/produit.model';

type Severity = "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined;

@Component({
  selector: 'app-detailstock',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './detailstock.html',
  styleUrl: './detailstock.css'
})
export class Detailstock implements OnInit {
  produit: Produit | null = null;
  loading: boolean = false;
  produitId: number | null = null;

  typeLabels = TYPE_MOUVEMENT_LABELS;
  typeColors = TYPE_MOUVEMENT_COLORS;

  constructor(
    private stockService: StockService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.produitId = +params['id'];
        this.loadProduit(this.produitId);
      }
    });
  }

  loadProduit(id: number): void {
    this.loading = true;
    this.stockService.getProduitById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.produit = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Produit non trouvé' });
        this.router.navigate(['/stocks']);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stocks']);
  }

  // ✅ CORRIGÉ : route /stocks/:id/edit       historique
  editProduit(): void {
    if (this.produit?.id) {
      this.router.navigate(['/stocks', this.produit.id, 'edit']);
    }
  }
  historique(): void {
    if (this.produit?.id) {
      this.router.navigate(['/stocks', this.produit.id, 'historique']);
    }
  }

  getStockSeverity(): Severity {
    if (!this.produit) return 'info';
    if (this.produit.quantiteStock === 0) return 'danger';
    if (this.produit.seuilAlerte && this.produit.quantiteStock <= this.produit.seuilAlerte) return 'warn';
    return 'success';
  }

  getStockLabel(): string {
    if (!this.produit) return '';
    if (this.produit.quantiteStock === 0) return 'Rupture de stock';
    if (this.produit.seuilAlerte && this.produit.quantiteStock <= this.produit.seuilAlerte) return 'Stock faible';
    return 'En stock';
  }

  getValeurStock(): number {
    if (!this.produit) return 0;
    return this.produit.quantiteStock * this.produit.prixUnitaire;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  }
}
