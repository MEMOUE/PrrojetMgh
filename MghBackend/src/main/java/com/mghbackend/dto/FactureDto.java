package com.mghbackend.dto;

import com.mghbackend.enums.StatutFacture;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureDto {
    private Long id;
    private String numeroFacture;

    @NotNull(message = "La date d'émission est obligatoire")
    private LocalDate dateEmission;

    @NotNull(message = "La date d'échéance est obligatoire")
    private LocalDate dateEcheance;

    private StatutFacture statut;

    // Références optionnelles
    private Long clientId;
    private String clientNom;

    private Long reservationId;
    private String reservationNumero;

    private Long commandeRestaurantId;
    private String commandeRestaurantNumero;

    @NotNull(message = "Le montant HT est obligatoire")
    @DecimalMin(value = "0.0", message = "Le montant doit être positif")
    private BigDecimal montantHT;

    @NotNull(message = "Le taux de TVA est obligatoire")
    @DecimalMin(value = "0.0", message = "Le taux doit être positif")
    private BigDecimal tauxTVA;

    private BigDecimal montantTVA;
    private BigDecimal montantTTC;
    private BigDecimal montantPaye;
    private BigDecimal montantRestant;
    private String notes;

    private Long hotelId;

    @NotEmpty(message = "La facture doit contenir au moins une ligne")
    private List<LigneFactureDto> lignes = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}