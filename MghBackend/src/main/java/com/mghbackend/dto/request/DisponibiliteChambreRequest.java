package com.mghbackend.dto.request;

import com.mghbackend.enums.TypeChambre;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisponibiliteChambreRequest {

    @NotNull(message = "La date d'arrivée est obligatoire")
    @FutureOrPresent(message = "La date d'arrivée ne peut pas être dans le passé")
    private LocalDate dateArrivee;

    @NotNull(message = "La date de départ est obligatoire")
    @Future(message = "La date de départ doit être dans le futur")
    private LocalDate dateDepart;

    private TypeChambre typeChambre;

    @Min(value = 1, message = "Au moins 1 personne requise")
    private Integer nombrePersonnes;
}