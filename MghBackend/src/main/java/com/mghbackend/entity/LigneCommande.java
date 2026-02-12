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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_menu_id", nullable = false)
    private ProduitMenu produitMenu;

    @Column(nullable = false)
    private Integer quantite;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sousTotal;

    @Column(columnDefinition = "TEXT")
    private String notes; // Notes spéciales pour la préparation
}