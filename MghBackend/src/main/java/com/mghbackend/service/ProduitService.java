package com.mghbackend.service;

import com.mghbackend.dto.ProduitDto;
import com.mghbackend.entity.*;
import com.mghbackend.enums.TypeMouvement;
import com.mghbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProduitService {

    private final ProduitRepository produitRepository;
    private final FournisseurRepository fournisseurRepository;
    private final HotelRepository hotelRepository;
    private final MouvementStockRepository mouvementStockRepository;
    private final UserRepository userRepository;

    public ProduitDto createProduit(Long hotelId, ProduitDto dto) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));

        if (produitRepository.findByCode(dto.getCode()).isPresent()) {
            throw new RuntimeException("Un produit avec ce code existe déjà");
        }

        Produit produit = new Produit();
        produit.setHotel(hotel);
        produit.setNom(dto.getNom());
        produit.setCode(dto.getCode());
        produit.setDescription(dto.getDescription());
        produit.setUnite(dto.getUnite());
        produit.setQuantiteStock(dto.getQuantiteStock() != null ? dto.getQuantiteStock() : BigDecimal.ZERO);
        produit.setSeuilAlerte(dto.getSeuilAlerte());
        produit.setPrixUnitaire(dto.getPrixUnitaire());

        if (dto.getFournisseurId() != null) {
            Fournisseur fournisseur = fournisseurRepository.findById(dto.getFournisseurId())
                    .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));
            produit.setFournisseur(fournisseur);
        }

        Produit saved = produitRepository.save(produit);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ProduitDto> getProduitsByHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return produitRepository.findByHotel(hotel).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProduitDto> getProduitsEnRupture(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return produitRepository.findProduitsEnRuptureStock(hotel).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void ajusterStock(Long produitId, BigDecimal quantite, TypeMouvement type, String motif, Long userId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Ajuster le stock
        if (type == TypeMouvement.ENTREE) {
            produit.setQuantiteStock(produit.getQuantiteStock().add(quantite));
        } else if (type == TypeMouvement.SORTIE) {
            if (produit.getQuantiteStock().compareTo(quantite) < 0) {
                throw new RuntimeException("Stock insuffisant");
            }
            produit.setQuantiteStock(produit.getQuantiteStock().subtract(quantite));
        } else if (type == TypeMouvement.AJUSTEMENT) {
            produit.setQuantiteStock(quantite);
        }

        produitRepository.save(produit);

        // Enregistrer le mouvement
        MouvementStock mouvement = new MouvementStock();
        mouvement.setProduit(produit);
        mouvement.setType(type);
        mouvement.setQuantite(quantite);
        mouvement.setMotif(motif);
        mouvement.setHotel(produit.getHotel());

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            mouvement.setUser(user);
        }

        mouvementStockRepository.save(mouvement);
    }

    private ProduitDto convertToDto(Produit produit) {
        ProduitDto dto = new ProduitDto();
        dto.setId(produit.getId());
        dto.setNom(produit.getNom());
        dto.setCode(produit.getCode());
        dto.setDescription(produit.getDescription());
        dto.setUnite(produit.getUnite());
        dto.setQuantiteStock(produit.getQuantiteStock());
        dto.setSeuilAlerte(produit.getSeuilAlerte());
        dto.setPrixUnitaire(produit.getPrixUnitaire());
        dto.setHotelId(produit.getHotel().getId());

        if (produit.getFournisseur() != null) {
            dto.setFournisseurId(produit.getFournisseur().getId());
            dto.setFournisseurNom(produit.getFournisseur().getNom());
        }

        dto.setCreatedAt(produit.getCreatedAt());
        dto.setUpdatedAt(produit.getUpdatedAt());
        return dto;
    }
}