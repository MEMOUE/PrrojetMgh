import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';

import { MessageService } from 'primeng/api';

// Models & Services
import { CreateUserRequest, User, AVAILABLE_ROLES, ROLE_LABELS } from '../../../models/employe.model';
import { EmployeService } from '../../../services/employe.service';

@Component({
  selector: 'app-createemploye',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MultiSelectModule,
    ToastModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './createemploye.html',
  styleUrl: './createemploye.css'
})
export class Createemploye implements OnInit {
  employeForm: FormGroup;
  isEditMode: boolean = false;
  employeId?: number;
  loading: boolean = false;
  availableRoles = AVAILABLE_ROLES;
  
  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.employeForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      roleNames: [[], [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeId = +params['id'];
        this.loadEmploye();
        // En mode édition, le mot de passe n'est pas obligatoire
        this.employeForm.get('password')?.clearValidators();
        this.employeForm.get('confirmPassword')?.clearValidators();
        this.employeForm.get('password')?.updateValueAndValidity();
        this.employeForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }

  loadEmploye(): void {
    if (!this.employeId) return;

    this.loading = true;
    this.employeService.getUserById(this.employeId).subscribe({
      next: (response) => {
        if (response.success) {
          const employe = response.data;
          this.employeForm.patchValue({
            username: employe.username,
            email: employe.email,
            firstName: employe.firstName,
            lastName: employe.lastName,
            phone: employe.phone,
            roleNames: employe.roleNames || []
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement de l\'employé'
        });
        this.loading = false;
      }
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (!password && !confirmPassword) {
      return null; // Pas d'erreur si les deux sont vides (mode édition sans changement de mot de passe)
    }
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.employeForm.invalid) {
      this.markFormGroupTouched(this.employeForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.updateEmploye();
    } else {
      this.createEmploye();
    }
  }

  createEmploye(): void {
    const formValue = this.employeForm.value;
    const request: CreateUserRequest = {
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone,
      password: formValue.password,
      roleNames: formValue.roleNames
    };

    this.employeService.createUser(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Employé créé avec succès'
          });
          setTimeout(() => {
            this.router.navigate(['/employes']);
          }, 1000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Erreur lors de la création de l\'employé'
        });
        this.loading = false;
      }
    });
  }

  updateEmploye(): void {
    if (!this.employeId) return;

    const formValue = this.employeForm.value;
    const updateData: Partial<User> = {
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone
    };

    this.employeService.updateUser(this.employeId, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Mettre à jour les rôles séparément
          this.updateRoles();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message
          });
          this.loading = false;
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Erreur lors de la mise à jour de l\'employé'
        });
        this.loading = false;
      }
    });
  }

  updateRoles(): void {
    if (!this.employeId) return;

    const roleNames: string[] = this.employeForm.value.roleNames;

    this.employeService.updateUserRoles(this.employeId, roleNames).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Employé mis à jour avec succès'
          });
          setTimeout(() => {
            this.router.navigate(['/employes']);
          }, 1000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la mise à jour des rôles'
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/employes']);
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
    const field = this.employeForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.employeForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Ce champ est obligatoire';
    }
    if (field.errors['email']) {
      return 'Format d\'email invalide';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field.errors['passwordMismatch']) {
      return 'Les mots de passe ne correspondent pas';
    }

    return 'Valeur invalide';
  }
}