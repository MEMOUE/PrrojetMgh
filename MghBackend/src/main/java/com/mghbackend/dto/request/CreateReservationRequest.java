package com.mghbackend.dto.request;

import com.mghbackend.dto.ClientDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReservationRequest {

    @NotNull(message = "La chambre est obligatoire")
    private Long chambreId;

    // Si le client existe déjà
    private Long clientId;

    // Sinon, créer un nouveau client
    @Valid
    private ClientDto newClient;

    @NotNull(message = "La date d'arrivée est obligatoire")
    @FutureOrPresent(message = "La date d'arrivée ne peut pas être dans le passé")
    private LocalDate dateArrivee;

    @NotNull(message = "La date de départ est obligatoire")
    @Future(message = "La date de départ doit être dans le futur")
    private LocalDate dateDepart;

    @NotNull(message = "Le nombre d'adultes est obligatoire")
    @Min(value = 1, message = "Au moins 1 adulte requis")
    private Integer nombreAdultes;

    @Min(value = 0, message = "Le nombre d'enfants ne peut pas être négatif")
    private Integer nombreEnfants = 0;

    private String notes;
    private String demandesSpeciales;

    private BigDecimal montantPaye;
    private String modePaiement;

    private String referenceExterne;
}