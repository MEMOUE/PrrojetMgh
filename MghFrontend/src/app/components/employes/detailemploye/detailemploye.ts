import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';

// Models & Services
import { User, ROLE_LABELS, ROLE_COLORS } from '../../../models/employe.model';
import { EmployeService } from '../../../services/employe.service';

type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined;

@Component({
  selector: 'app-detailemploye',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
    DividerModule,
    ConfirmDialogModule
  ],
  
  providers: [MessageService, ConfirmationService],
  templateUrl: './detailemploye.html',
  styleUrl: './detailemploye.css'
})

export class Detailemploye implements OnInit {
  employe?: User;
  loading: boolean = false;
  employeId?: number;
  
  roleLabels = ROLE_LABELS;
  roleColors = ROLE_COLORS;
  
  constructor(
    private employeService: EmployeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.employeId = +params['id'];
        this.loadEmploye();
      }
    });
  }

  loadEmploye(): void {
    if (!this.employeId) return;

    this.loading = true;
    this.employeService.getUserById(this.employeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.employe = response.data;
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
        this.goBack();
      }
    });
  }

  toggleStatus(): void {
    if (!this.employe) return;

    const action = this.employe.active ? 'désactiver' : 'activer';
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment ${action} cet employé ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employeService.toggleStatus(this.employe!.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `Employé ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`
              });
              this.loadEmploye();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: response.message
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors du changement de statut'
            });
          }
        });
      }
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/employes', this.employeId, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/employes']);
  }

  getFullName(): string {
    if (!this.employe) return '';
    return `${this.employe.firstName} ${this.employe.lastName}`;
  }

  getRoleLabel(roleName: string): string {
    return this.roleLabels[roleName] || roleName;
  }

  getRoleColor(roleName: string): Severity {
    return (this.roleColors[roleName] || 'secondary') as Severity;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}