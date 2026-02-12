// ===============================
// MODÈLE PRODUIT/STOCK
// Compatible avec le backend Spring Boot
// ===============================

export interface Produit {
  id?: number;
  nom: string;
  code: string;
  description?: string;
  unite: string; // kg, L, pièce, etc.
  quantiteStock: number;
  seuilAlerte?: number;
  prixUnitaire: number;
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