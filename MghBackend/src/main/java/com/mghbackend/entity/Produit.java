package com.mghbackend.entity;

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
    private String code; // Code produit unique

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String unite; // kg, L, pièce, etc.

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantiteStock = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal seuilAlerte; // Seuil d'alerte de stock bas

    @Column(precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
}