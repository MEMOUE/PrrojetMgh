package com.mghbackend.dto;

import com.mghbackend.enums.TypeMouvement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MouvementStockDto {
    private Long id;

    private Long produitId;
    private String produitNom;
    private String produitCode;
    private String produitUnite;

    private TypeMouvement type;
    private BigDecimal quantite;
    private String motif;
    private LocalDateTime dateMouvement;

    private Long userId;
    private String userNom;

    private Long hotelId;

    private LocalDateTime createdAt;
}