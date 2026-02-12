// ===============================
// MODELS POUR LE RESTAURANT
// Compatible avec le backend Spring Boot
// ===============================

export interface ProduitMenu {
  id?: number;
  nom: string;
  description?: string;
  prix: number;
  categorie: string; // Entrée, Plat, Dessert, Boisson
  disponible?: boolean;
  imageUrl?: string;
  hotelId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LigneCommande {
  id?: number;
  produitMenuId: number;
  produitMenuNom?: string;
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

export enum CategorieMenu {
  ENTREE = 'Entrée',
  PLAT = 'Plat',
  DESSERT = 'Dessert',
  BOISSON = 'Boisson',
  AUTRE = 'Autre'
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

// Catégories disponibles
export const CATEGORIES_MENU = [
  { value: 'Entrée', label: 'Entrée' },
  { value: 'Plat', label: 'Plat' },
  { value: 'Dessert', label: 'Dessert' },
  { value: 'Boisson', label: 'Boisson' },
  { value: 'Autre', label: 'Autre' }
];