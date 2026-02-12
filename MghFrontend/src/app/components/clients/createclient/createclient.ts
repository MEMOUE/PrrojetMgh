import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';
import { ClientService } from '../../../services/client.service';
import { Client, TYPES_PIECE, PAYS_COURANTS } from '../../../models/client.model ';

@Component({
  selector: 'app-createclient',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './createclient.html',
  styleUrl: './createclient.css'
})
export class Createclient implements OnInit {
  clientForm!: FormGroup;
  isEditMode: boolean = false;
  clientId?: number;
  loading: boolean = false;
  
  typesPiece = TYPES_PIECE;
  paysCourants = PAYS_COURANTS.map(p => ({ label: p, value: p }));

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.clientId = +params['id'];
        this.loadClient();
      }
    });
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      pieceIdentite: [''],
      typePiece: [''],
      dateNaissance: [null],
      nationalite: [''],
      adresse: [''],
      ville: [''],
      pays: [''],
      notes: ['']
    });
  }

  loadClient(): void {
    if (!this.clientId) return;

    this.loading = true;
    this.clientService.getClientById(this.clientId).subscribe({
      next: (response) => {
        if (response.success) {
          const client = response.data;
          this.clientForm.patchValue({
            prenom: client.prenom,
            nom: client.nom,
            email: client.email,
            telephone: client.telephone,
            pieceIdentite: client.pieceIdentite,
            typePiece: client.typePiece,
            dateNaissance: client.dateNaissance ? new Date(client.dateNaissance) : null,
            nationalite: client.nationalite,
            adresse: client.adresse,
            ville: client.ville,
            pays: client.pays,
            notes: client.notes
          });
          this.loading = false;
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement du client'
        });
        this.loading = false;
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched(this.clientForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires correctement'
      });
      return;
    }

    const clientData: Client = {
      ...this.clientForm.value,
      dateNaissance: this.clientForm.value.dateNaissance 
        ? new Date(this.clientForm.value.dateNaissance).toISOString().split('T')[0]
        : null
    };

    this.loading = true;

    if (this.isEditMode && this.clientId) {
      this.updateClient(clientData);
    } else {
      this.createClient(clientData);
    }
  }

  createClient(clientData: Client): void {
    this.clientService.createClient(clientData).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Client créé avec succès'
          });
          this.router.navigate(['/clients']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Erreur lors de la création du client'
        });
        this.loading = false;
      }
    });
  }

  updateClient(clientData: Client): void {
    this.clientService.updateClient(this.clientId!, clientData).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Client mis à jour avec succès'
          });
          this.router.navigate(['/clients']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Erreur lors de la mise à jour du client'
        });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est obligatoire';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['email']) return 'Format d\'email invalide';
      if (field.errors['pattern']) return 'Format invalide';
    }
    return '';
  }
}