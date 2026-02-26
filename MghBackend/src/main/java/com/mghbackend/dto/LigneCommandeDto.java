package com.mghbackend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneCommandeDto {
    private Long id;

    /** ID du produit en stock (anciennement produitMenuId) */
    @NotNull(message = "Le produit est obligatoire")
    private Long produitId;

    private String produitNom;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantite;

    @NotNull(message = "Le prix unitaire est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix doit être positif")
    private BigDecimal prixUnitaire;

    private BigDecimal sousTotal;
    private String notes;
}