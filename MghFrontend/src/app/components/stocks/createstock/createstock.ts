import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services et modèles
import { StockService } from '../../../services/stock.service';
import { Produit, Fournisseur, UNITES_MESURE } from '../../../models/produit.model';

@Component({
  selector: 'app-createstock',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './createstock.html',
  styleUrl: './createstock.css'
})
export class Createstock implements OnInit {
  produitForm: FormGroup;
  loading: boolean = false;
  isEditMode: boolean = false;
  produitId: number | null = null;

  // Options
  unites = UNITES_MESURE;
  fournisseurs: Fournisseur[] = [];

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.produitForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
      unite: ['', Validators.required],
      quantiteStock: [0, [Validators.required, Validators.min(0)]],
      seuilAlerte: [null, Validators.min(0)],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      fournisseurId: [null]
    });
  }

  ngOnInit(): void {
    // Charger les fournisseurs
    this.loadFournisseurs();

    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.produitId = +params['id'];
        this.loadProduit(this.produitId);
      }
    });
  }

  /**
   * Charger les fournisseurs
   */
  loadFournisseurs(): void {
    this.stockService.getFournisseursActifs().subscribe({
      next: (response) => {
        if (response.success) {
          this.fournisseurs = response.data.map(f => ({
            ...f,
            label: f.nom,
            value: f.id
          }));
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des fournisseurs:', error);
      }
    });
  }

  /**
   * Charger un produit pour l'édition
   */
  loadProduit(id: number): void {
    this.loading = true;
    this.stockService.getProduitById(id).subscribe({
      next: (response) => {
        if (response.success) {
          const produit = response.data;
          this.produitForm.patchValue({
            nom: produit.nom,
            code: produit.code,
            description: produit.description,
            unite: produit.unite,
            quantiteStock: produit.quantiteStock,
            seuilAlerte: produit.seuilAlerte,
            prixUnitaire: produit.prixUnitaire,
            fournisseurId: produit.fournisseurId
          });

          // Désactiver le champ code en mode édition
          this.produitForm.get('code')?.disable();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Produit non trouvé'
        });
        this.router.navigate(['/stocks']);
        this.loading = false;
      }
    });
  }

  /**
   * Sauvegarder le produit
   */
  onSubmit(): void {
    if (this.produitForm.invalid) {
      Object.keys(this.produitForm.controls).forEach(key => {
        this.produitForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const produitData: Produit = {
      ...this.produitForm.getRawValue() // getRawValue pour inclure les champs désactivés
    };

    const request = this.isEditMode
      ? this.stockService.updateProduit(this.produitId!, produitData)
      : this.stockService.createProduit(produitData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: this.isEditMode 
              ? 'Produit modifié avec succès' 
              : 'Produit créé avec succès'
          });
          
          setTimeout(() => {
            this.router.navigate(['/stocks']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Erreur lors de la sauvegarde du produit'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Annuler et retourner à la liste
   */
  cancel(): void {
    this.router.navigate(['/stocks']);
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.produitForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  /**
   * Obtenir le message d'erreur d'un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.produitForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} caractères autorisés`;
    }
    if (field.hasError('min')) {
      return 'La valeur doit être positive';
    }
    return '';
  }
}