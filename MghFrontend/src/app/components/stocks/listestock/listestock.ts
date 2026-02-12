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

import { MessageService, ConfirmationService } from 'primeng/api';

// Services et modèles
import { StockService } from '../../../services/stock.service';
import { Produit, TypeMouvement, TYPE_MOUVEMENT_LABELS, UNITES_MESURE } from '../../../models/produit.model';

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
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    SelectModule
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
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.ENTREE], value: TypeMouvement.ENTREE },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.SORTIE], value: TypeMouvement.SORTIE },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.AJUSTEMENT], value: TypeMouvement.AJUSTEMENT },
    { label: TYPE_MOUVEMENT_LABELS[TypeMouvement.RETOUR], value: TypeMouvement.RETOUR }
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

  /**
   * Charger tous les produits
   */
  loadProduits(): void {
    this.loading = true;
    this.stockService.getProduits().subscribe({
      next: (response) => {
        if (response.success) {
          this.produits = response.data;
          this.produitsFiltered = response.data;
          this.calculateStatistics();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Produits chargés avec succès'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Erreur lors du chargement des produits'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Calculer les statistiques
   */
  calculateStatistics(): void {
    this.totalProduits = this.produits.length;
    this.totalValeurStock = this.produits.reduce(
      (total, p) => total + (p.quantiteStock * p.prixUnitaire),
      0
    );
    this.produitsEnRupture = this.produits.filter(
      p => p.seuilAlerte && p.quantiteStock === 0
    ).length;
    this.produitsEnAlerte = this.produits.filter(
      p => p.seuilAlerte && p.quantiteStock > 0 && p.quantiteStock <= p.seuilAlerte
    ).length;
  }

  /**
   * Rechercher des produits
   */
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

  /**
   * Effacer la recherche
   */
  clearSearch(): void {
    this.searchValue = '';
    this.produitsFiltered = this.produits;
  }

  /**
   * Aller à la page de création
   */
  goToCreate(): void {
    this.router.navigate(['/stocks/create']);
  }

  /**
   * Voir les détails d'un produit
   */
  viewDetails(produit: Produit): void {
    this.router.navigate(['/stocks', produit.id]);
  }

  /**
   * Modifier un produit
   */
  editProduit(produit: Produit): void {
    this.router.navigate(['/stocks/edit', produit.id]);
  }

  /**
   * Ouvrir le dialogue d'ajustement de stock
   */
  openAjustementDialog(produit: Produit): void {
    this.produitSelectionne = produit;
    this.quantiteAjustement = 0;
    this.typeAjustement = TypeMouvement.ENTREE;
    this.motifAjustement = '';
    this.displayAjustementDialog = true;
  }

  /**
   * Sauvegarder l'ajustement de stock
   */
  saveAjustement(): void {
    if (!this.produitSelectionne || this.quantiteAjustement <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez saisir une quantité valide'
      });
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
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Stock ajusté avec succès'
          });
          this.displayAjustementDialog = false;
          this.loadProduits(); // Recharger la liste
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajustement:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Erreur lors de l\'ajustement du stock'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Supprimer un produit
   */
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
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Produit supprimé avec succès'
              });
              this.loadProduits();
            }
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.message || 'Erreur lors de la suppression'
            });
          }
        });
      }
    });
  }

  /**
   * Obtenir la sévérité du tag de stock
   */
  getStockSeverity(produit: Produit): Severity {
    if (produit.quantiteStock === 0) {
      return 'danger';
    }
    if (produit.seuilAlerte && produit.quantiteStock <= produit.seuilAlerte) {
      return 'warning' as Severity;
    }
    return 'success';
  }

  /**
   * Obtenir le label du stock
   */
  getStockLabel(produit: Produit): string {
    if (produit.quantiteStock === 0) {
      return 'Rupture';
    }
    if (produit.seuilAlerte && produit.quantiteStock <= produit.seuilAlerte) {
      return 'Alerte';
    }
    return 'En stock';
  }

  /**
   * Formater le prix
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }
}