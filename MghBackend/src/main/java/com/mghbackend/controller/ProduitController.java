package com.mghbackend.controller;

import com.mghbackend.dto.ProduitDto;
import com.mghbackend.dto.reponse.ApiResponse;
import com.mghbackend.enums.TypeMouvement;
import com.mghbackend.security.CustomUserPrincipal;
import com.mghbackend.service.ProduitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProduitController {

    private final ProduitService produitService;

    @PostMapping
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_MODIFIER_STOCK')")
    public ResponseEntity<ApiResponse<ProduitDto>> createProduit(
            @Valid @RequestBody ProduitDto dto,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            ProduitDto produit = produitService.createProduit(principal.getHotelId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Produit créé avec succès", produit));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_STOCK')")
    public ResponseEntity<ApiResponse<List<ProduitDto>>> getProduits(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ProduitDto> produits = produitService.getProduitsByHotel(principal.getHotelId());
            return ResponseEntity.ok(ApiResponse.success(produits));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/rupture")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_STOCK')")
    public ResponseEntity<ApiResponse<List<ProduitDto>>> getProduitsEnRupture(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ProduitDto> produits = produitService.getProduitsEnRupture(principal.getHotelId());
            return ResponseEntity.ok(ApiResponse.success(produits));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/ajuster-stock")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_MODIFIER_STOCK')")
    public ResponseEntity<ApiResponse<Void>> ajusterStock(
            @PathVariable Long id,
            @RequestParam BigDecimal quantite,
            @RequestParam TypeMouvement type,
            @RequestParam(required = false) String motif,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            Long userId = principal.getAccountType().equals("USER") ? principal.getId() : null;
            produitService.ajusterStock(id, quantite, type, motif, userId);
            return ResponseEntity.ok(ApiResponse.success("Stock ajusté avec succès", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}