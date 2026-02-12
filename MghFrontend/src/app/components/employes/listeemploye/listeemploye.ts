import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip'; 

import { MessageService, ConfirmationService } from 'primeng/api';

// Models & Services
import { User, ROLE_LABELS, ROLE_COLORS } from '../../../models/employe.model';
import { EmployeService } from '../../../services/employe.service';

interface StatEmployes {
  total: number;
  actifs: number;
  inactifs: number;
};
type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined;

@Component({
  selector: 'app-listemploye',
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
    CheckboxModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './listeemploye.html',
  styleUrl: './listeemploye.css'
})
export class Listemploye implements OnInit {
  employes: User[] = [];
  filteredEmployes: User[] = [];
  loading: boolean = false;
  
  // Filtres
  searchTerm: string = '';
  includeInactive: boolean = false;
  selectedRole: string = '';
  
  // Statistiques
  stats: StatEmployes = {
    total: 0,
    actifs: 0,
    inactifs: 0
  };

  // Labels et couleurs
  roleLabels = ROLE_LABELS;
  roleColors = ROLE_COLORS;

  constructor(
    private employeService: EmployeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployes();
  }

  loadEmployes(): void {
    this.loading = true;
    this.employeService.getUsers(this.includeInactive).subscribe({
      next: (response) => {
        if (response.success) {
          this.employes = response.data;
          this.filteredEmployes = [...this.employes];
          this.calculateStats();
          this.applyFilters();
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
          detail: 'Erreur lors du chargement des employés'
        });
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.employes.length;
    this.stats.actifs = this.employes.filter(e => e.active).length;
    this.stats.inactifs = this.employes.filter(e => !e.active).length;
  }

  applyFilters(): void {
    let filtered = [...this.employes];

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.firstName?.toLowerCase().includes(term) ||
        e.lastName?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term) ||
        e.username?.toLowerCase().includes(term)
      );
    }

    // Filtre par rôle
    if (this.selectedRole) {
      filtered = filtered.filter(e =>
        e.roleNames?.includes(this.selectedRole)
      );
    }

    this.filteredEmployes = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onIncludeInactiveChange(): void {
    this.loadEmployes();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.includeInactive = false;
    this.loadEmployes();
  }

  navigateToCreate(): void {
    this.router.navigate(['/employes/create']);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/employes', id]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/employes', id, 'edit']);
  }

  toggleStatus(employe: User): void {
    const action = employe.active ? 'désactiver' : 'activer';
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment ${action} cet employé ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employeService.toggleStatus(employe.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `Employé ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`
              });
              this.loadEmployes();
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

  getRoleLabel(roleName: string): string {
    return this.roleLabels[roleName] || roleName;
  }

  getRoleColor(roleName: string): Severity {
    return (this.roleColors[roleName] || "secondary") as Severity;
  }

  getFullName(employe: User): string {
    return `${employe.firstName} ${employe.lastName}`;
  }
}