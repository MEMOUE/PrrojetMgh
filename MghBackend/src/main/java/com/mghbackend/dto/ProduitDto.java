package com.mghbackend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProduitDto {
    private Long id;

    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nom;

    @NotBlank(message = "Le code du produit est obligatoire")
    private String code;

    private String description;

    @NotBlank(message = "L'unité est obligatoire")
    private String unite;

    @NotNull(message = "La quantité en stock est obligatoire")
    @DecimalMin(value = "0.0", message = "La quantité doit être positive")
    private BigDecimal quantiteStock;

    private BigDecimal seuilAlerte;

    @NotNull(message = "Le prix unitaire est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix doit être positif")
    private BigDecimal prixUnitaire;

    private Long fournisseurId;
    private String fournisseurNom;

    private Long hotelId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}