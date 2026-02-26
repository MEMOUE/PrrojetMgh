package com.mghbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Entity
@Table(name = "lignes_commande_restaurant")
@Data
@EqualsAndHashCode(callSuper = true)
public class LigneCommande extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    private CommandeRestaurant commande;

    /**
     * Lien direct vers le stock : un produit du stock = un item du menu.
     * Remplace l'ancienne entité ProduitMenu.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Column(nullable = false)
    private Integer quantite;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sousTotal;

    @Column(columnDefinition = "TEXT")
    private String notes;
}