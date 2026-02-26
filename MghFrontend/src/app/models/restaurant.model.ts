// ===============================
// MODELS POUR LE RESTAURANT
// Compatible avec le backend Spring Boot
// Les produits du menu proviennent directement du stock (Produit)
// ===============================

import { Produit, TypeProduit } from './produit.model';

// ProduitMenu est maintenant un alias vers Produit (fusion économat/restaurant)
export type ProduitMenu = Produit;

export interface LigneCommande {
  id?: number;
  produitId: number;          // Référence vers Produit (anciennement produitMenuId)
  produitNom?: string;         // Nom du produit (anciennement produitMenuNom)
  quantite: number;
  prixUnitaire: number;
  sousTotal?: number;
  notes?: string;
}

export interface CommandeRestaurant {
  id?: number;
  numeroCommande?: string;

  // Client externe (non-client de l'hôtel)
  nomClientExterne?: string;
  telephoneClientExterne?: string;

  // OU Client de l'hôtel
  clientId?: number;
  clientNom?: string;

  // OU Réservation
  reservationId?: number;
  reservationNumero?: string;

  numeroTable?: string;
  statut: StatutCommandeRestaurant;
  montantTotal: number;
  montantPaye?: number;
  notes?: string;
  dateCommande?: string;
  dateService?: string;

  serveurId?: number;
  serveurNom?: string;

  hotelId?: number;
  lignes: LigneCommande[];

  createdAt?: string;
  updatedAt?: string;
}

export enum StatutCommandeRestaurant {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_PREPARATION = 'EN_PREPARATION',
  PRETE = 'PRETE',
  SERVIE = 'SERVIE',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE'
}

// Labels pour les statuts
export const STATUT_COMMANDE_LABELS: Record<StatutCommandeRestaurant, string> = {
  [StatutCommandeRestaurant.EN_ATTENTE]: 'En attente',
  [StatutCommandeRestaurant.EN_PREPARATION]: 'En préparation',
  [StatutCommandeRestaurant.PRETE]: 'Prête',
  [StatutCommandeRestaurant.SERVIE]: 'Servie',
  [StatutCommandeRestaurant.PAYEE]: 'Payée',
  [StatutCommandeRestaurant.ANNULEE]: 'Annulée'
};

// Couleurs pour les statuts
export const STATUT_COMMANDE_COLORS: Record<StatutCommandeRestaurant, string> = {
  [StatutCommandeRestaurant.EN_ATTENTE]: 'warning',
  [StatutCommandeRestaurant.EN_PREPARATION]: 'info',
  [StatutCommandeRestaurant.PRETE]: 'success',
  [StatutCommandeRestaurant.SERVIE]: 'primary',
  [StatutCommandeRestaurant.PAYEE]: 'success',
  [StatutCommandeRestaurant.ANNULEE]: 'danger'
};

// Catégories du menu alignées sur TypeProduit (backend)
export const CATEGORIES_MENU = [
  { value: TypeProduit.ENTREE,  label: 'Entrées',   icon: 'pi-star' },
  { value: TypeProduit.PLAT,    label: 'Plats',     icon: 'pi-sun' },
  { value: TypeProduit.DESSERT, label: 'Desserts',  icon: 'pi-heart' },
  { value: TypeProduit.BOISSON, label: 'Boissons',  icon: 'pi-droplet' },
  { value: TypeProduit.AUTRE,   label: 'Autres',    icon: 'pi-box' }
];
