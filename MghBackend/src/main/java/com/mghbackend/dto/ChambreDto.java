package com.mghbackend.dto;

import com.mghbackend.enums.StatutChambre;
import com.mghbackend.enums.TypeChambre;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChambreDto {
    private Long id;

    @NotBlank(message = "Le numéro de chambre est obligatoire")
    @Size(max = 20, message = "Le numéro ne doit pas dépasser 20 caractères")
    private String numero;

    @NotNull(message = "Le type de chambre est obligatoire")
    private TypeChambre type;

    @NotNull(message = "Le prix par nuit est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
    private BigDecimal prixParNuit;

    @NotNull(message = "La capacité est obligatoire")
    @Min(value = 1, message = "La capacité doit être au moins 1")
    private Integer capacite;

    @NotNull(message = "La superficie est obligatoire")
    @Min(value = 1, message = "La superficie doit être au moins 1 m²")
    private Integer superficie;

    private String description;

    @NotNull(message = "Le statut est obligatoire")
    private StatutChambre statut;

    @NotNull(message = "L'étage est obligatoire")
    private Integer etage;

    private Boolean wifi;
    private Boolean climatisation;
    private Boolean television;
    private Boolean minibar;
    private Boolean coffre;
    private Boolean balcon;
    private Boolean vueMer;

    private Long hotelId;
    private String hotelName;

    private List<String> images = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}