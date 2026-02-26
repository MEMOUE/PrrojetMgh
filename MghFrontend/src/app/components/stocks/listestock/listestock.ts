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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';

// Services et modèles
import { StockService } from '../../../services/stock.service';
import { Produit, TypeMouvement, TYPE_MOUVEMENT_LABELS } from '../../../models/produit.model';

type Severity = "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined;

@Component({
  selector: 'app-listestock',
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
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './listestock.html',
  styleUrl: './listestock.css'
})
export class Listestock implements OnInit {
  produits: Produit[] = [];
  produitsFiltered: Produit[] = [];
  loading: boolean = false;
  searchValue: string = '';

  // Statistiques
  totalProduits: number = 0;
  totalValeurStock: number = 0;
  produitsEnRupture: number = 0;
  produitsEnAlerte: number = 0;

  // Dialogue ajustement de stock
  displayAjustementDialog: boolean = false;
  produitSelectionne: Produit | null = null;
  quantiteAjustement: number = 0;
  typeAjustement: TypeMouvement = TypeMouvement.ENTREE;
  motifAjustement: string = '';

  // Options
  typesMouvement = [
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.ENTREE],     value: TypeMouvement.ENTREE },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.SORTIE],     value: TypeMouvement.SORTIE },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.AJUSTEMENT], value: TypeMouvement.AJUSTEMENT },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.RETOUR],     value: TypeMouvement.RETOUR }
  ];

  constructor(
    private stockService: StockService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.stockService.getProduits().subscribe({
      next: (response) => {
        if (response.success) {
          this.produits = response.data;
          this.produitsFiltered = response.data;
          this.calculateStatistics();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.message || 'Erreur chargement' });
        this.loading = false;
      }
    });
  }

  calculateStatistics(): void {
    this.totalProduits      = this.produits.length;
    this.totalValeurStock   = this.produits.reduce((t, p) => t + (p.quantiteStock * p.prixUnitaire), 0);
    this.produitsEnRupture  = this.produits.filter(p => p.quantiteStock === 0).length;
    this.produitsEnAlerte   = this.produits.filter(p => p.seuilAlerte && p.quantiteStock > 0 && p.quantiteStock <= p.seuilAlerte).length;
  }

  onSearch(): void {
    if (!this.searchValue.trim()) {
      this.produitsFiltered = this.produits;
      return;
    }
    const search = this.searchValue.toLowerCase();
    this.produitsFiltered = this.produits.filter(p =>
      p.nom.toLowerCase().includes(search) ||
      p.code.toLowerCase().includes(search) ||
      (p.description && p.description.toLowerCase().includes(search)) ||
      (p.fournisseurNom && p.fournisseurNom.toLowerCase().includes(search))
    );
  }

  clearSearch(): void {
    this.searchValue = '';
    this.produitsFiltered = this.produits;
  }

  goToCreate(): void {
    this.router.navigate(['/stocks/create']);
  }

  // ✅ CORRIGÉ : route /stocks/:id
  viewDetails(produit: Produit): void {
    this.router.navigate(['/stocks', produit.id]);
  }

  // ✅ CORRIGÉ : route /stocks/:id/edit
  editProduit(produit: Produit): void {
    this.router.navigate(['/stocks', produit.id, 'edit']);
  }

  openAjustementDialog(produit: Produit): void {
    this.produitSelectionne  = produit;
    this.quantiteAjustement  = 0;
    this.typeAjustement      = TypeMouvement.ENTREE;
    this.motifAjustement     = '';
    this.displayAjustementDialog = true;
  }

  saveAjustement(): void {
    if (!this.produitSelectionne || this.quantiteAjustement <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez saisir une quantité valide' });
      return;
    }

    this.loading = true;
    this.stockService.ajusterStock(
      this.produitSelectionne.id!,
      this.quantiteAjustement,
      this.typeAjustement,
      this.motifAjustement
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stock ajusté avec succès' });
          this.displayAjustementDialog = false;
          this.loadProduits();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur ajustement:', error);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.message || 'Erreur ajustement' });
        this.loading = false;
      }
    });
  }

  deleteProduit(produit: Produit): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le produit "${produit.nom}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.stockService.deleteProduit(produit.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Produit supprimé' });
              this.loadProduits();
            }
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.message || 'Erreur suppression' });
          }
        });
      }
    });
  }

  getStockSeverity(produit: Produit): Severity {
    if (produit.quantiteStock === 0) return 'danger';
    if (produit.seuilAlerte && produit.quantiteStock <= produit.seuilAlerte) return 'warn';
    return 'success';
  }

  getStockLabel(produit: Produit): string {
    if (produit.quantiteStock === 0) return 'Rupture';
    if (produit.seuilAlerte && produit.quantiteStock <= produit.seuilAlerte) return 'Alerte';
    return 'En stock';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  // Getter pratique pour l'unité dans le dialog
  get uniteSelectionnee(): string {
    return this.produitSelectionne?.unite ?? '';
  }
}
