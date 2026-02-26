// ===============================
// MODÈLE PRODUIT/STOCK
// Compatible avec le backend Spring Boot
// ===============================

export enum TypeProduit {
  BOISSON = 'BOISSON',
  ENTREE = 'ENTREE',
  PLAT = 'PLAT',
  DESSERT = 'DESSERT',
  AUTRE = 'AUTRE'
}

// Labels pour les types de produit
export const TYPE_PRODUIT_LABELS: Record<TypeProduit, string> = {
  [TypeProduit.BOISSON]: 'Boisson',
  [TypeProduit.ENTREE]: 'Entrée',
  [TypeProduit.PLAT]: 'Plat',
  [TypeProduit.DESSERT]: 'Dessert',
  [TypeProduit.AUTRE]: 'Autre'
};

export interface Produit {
  id?: number;
  nom: string;
  code: string;
  description?: string;
  unite: string; // kg, L, pièce, etc.
  quantiteStock: number;
  seuilAlerte?: number;
  prixUnitaire: number;
  // Champs restaurant (menu intégré)
  typeProduit?: TypeProduit;
  disponible?: boolean;
  imageUrl?: string;
  // Fournisseur
  fournisseurId?: number;
  fournisseurNom?: string;
  hotelId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Fournisseur {
  id?: number;
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  contact?: string;
  notes?: string;
  actif?: boolean;
  hotelId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MouvementStock {
  id?: number;
  produitId: number;
  produitNom?: string;
  produitCode?: string;
  produitUnite?: string;  
  type: TypeMouvement;
  quantite: number;
  motif?: string;
  dateMouvement?: string;
  userId?: number;
  userNom?: string;
  hotelId?: number;
  createdAt?: string;
}

export enum TypeMouvement {
  ENTREE = 'ENTREE',
  SORTIE = 'SORTIE',
  AJUSTEMENT = 'AJUSTEMENT',
  RETOUR = 'RETOUR'
}

// Labels pour les types de mouvement
export const TYPE_MOUVEMENT_LABELS: Record<TypeMouvement, string> = {
  [TypeMouvement.ENTREE]: 'Entrée',
  [TypeMouvement.SORTIE]: 'Sortie',
  [TypeMouvement.AJUSTEMENT]: 'Ajustement',
  [TypeMouvement.RETOUR]: 'Retour'
};

// Couleurs pour les types de mouvement
export const TYPE_MOUVEMENT_COLORS: Record<TypeMouvement, string> = {
  [TypeMouvement.ENTREE]: 'success',
  [TypeMouvement.SORTIE]: 'danger',
  [TypeMouvement.AJUSTEMENT]: 'warning',
  [TypeMouvement.RETOUR]: 'info'
};

// Options pour le select TypeProduit
export const TYPES_PRODUIT_OPTIONS = [
  { value: TypeProduit.BOISSON, label: 'Boisson' },
  { value: TypeProduit.ENTREE, label: 'Entrée' },
  { value: TypeProduit.PLAT, label: 'Plat' },
  { value: TypeProduit.DESSERT, label: 'Dessert' },
  { value: TypeProduit.AUTRE, label: 'Autre' }
];

// Unités de mesure
export const UNITES_MESURE = [
  { value: 'kg', label: 'Kilogramme (kg)' },
  { value: 'g', label: 'Gramme (g)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'pièce', label: 'Pièce' },
  { value: 'boîte', label: 'Boîte' },
  { value: 'paquet', label: 'Paquet' },
  { value: 'carton', label: 'Carton' },
  { value: 'bouteille', label: 'Bouteille' },
  { value: 'sachet', label: 'Sachet' },
  { value: 'unité', label: 'Unité' }
];
