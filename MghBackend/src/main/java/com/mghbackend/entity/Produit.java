package com.mghbackend.entity;

import com.mghbackend.enums.TypeProduit;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Entity
@Table(name = "produits")
@Data
@EqualsAndHashCode(callSuper = true)
public class Produit extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String unite; // kg, L, pièce, etc.

    // ── Stock ──────────────────────────────────────────────────
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantiteStock = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal seuilAlerte;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    // ── Catégorie restaurant ────────────────────────────────────
    /**
     * Détermine dans quel onglet du menu restaurant ce produit apparaît.
     * BOISSON → onglet Boissons, ENTREE → onglet Entrées, etc.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeProduit typeProduit = TypeProduit.AUTRE;

    /**
     * Indique si le produit est visible / commandable depuis le restaurant.
     * Mis à false automatiquement quand le stock tombe à 0.
     */
    @Column(nullable = false)
    private Boolean disponible = true;

    @Column(length = 255)
    private String imageUrl;

    // ── Relations ───────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
}