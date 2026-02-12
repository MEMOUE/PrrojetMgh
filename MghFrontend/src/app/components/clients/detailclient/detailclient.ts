import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';

import { MessageService, ConfirmationService } from 'primeng/api';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model '; 
@Component({
  selector: 'app-detailclient',
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
  providers: [MessageService, ConfirmationService],
  templateUrl: './detailclient.html',
  styleUrl: './detailclient.css'
})
export class Detailclient implements OnInit {
  client?: Client;
  loading: boolean = true;
  clientId!: number;

  constructor(
    private clientService: ClientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clientId = +params['id'];
      this.loadClient();
    });
  }

  loadClient(): void {
    this.loading = true;
    this.clientService.getClientById(this.clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.client = response.data;
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

  editClient(): void {
    this.router.navigate(['/clients', this.clientId, 'edit']);
  }

  deleteClient(): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le client ${this.client?.prenom} ${this.client?.nom} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.clientService.deleteClient(this.clientId).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Client supprimé avec succès'
              });
              this.router.navigate(['/clients']);
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.message || 'Erreur lors de la suppression'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) return '-';
    const d = new Date(dateTime);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFullName(): string {
    if (!this.client) return '';
    return `${this.client.prenom} ${this.client.nom}`;
  }
}