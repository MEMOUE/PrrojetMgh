package com.mghbackend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateReservationRequest {

    @NotNull(message = "La date d'arrivée est obligatoire")
    private LocalDate dateArrivee;

    @NotNull(message = "La date de départ est obligatoire")
    private LocalDate dateDepart;

    @NotNull(message = "Le nombre d'adultes est obligatoire")
    @Min(value = 1, message = "Au moins 1 adulte requis")
    private Integer nombreAdultes;

    @Min(value = 0, message = "Le nombre d'enfants ne peut pas être négatif")
    private Integer nombreEnfants;

    private String notes;
    private String demandesSpeciales;
    private String referenceExterne;
}