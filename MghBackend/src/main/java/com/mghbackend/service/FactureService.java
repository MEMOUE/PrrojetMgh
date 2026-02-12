package com.mghbackend.service;

import com.mghbackend.dto.FactureDto;
import com.mghbackend.dto.LigneFactureDto;
import com.mghbackend.entity.*;
import com.mghbackend.enums.StatutFacture;
import com.mghbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FactureService {

    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;
    private final ReservationRepository reservationRepository;
    private final CommandeRestaurantRepository commandeRestaurantRepository;
    private final HotelRepository hotelRepository;
    private final LigneFactureRepository ligneFactureRepository;

    public FactureDto createFacture(Long hotelId, FactureDto dto) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));

        Facture facture = new Facture();
        facture.setHotel(hotel);
        facture.setNumeroFacture(generateNumeroFacture());
        facture.setDateEmission(dto.getDateEmission());
        facture.setDateEcheance(dto.getDateEcheance());
        facture.setNotes(dto.getNotes());

        // Lier à client, réservation ou commande restaurant
        if (dto.getClientId() != null) {
            Client client = clientRepository.findById(dto.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));
            facture.setClient(client);
        }

        if (dto.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(dto.getReservationId())
                    .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
            facture.setReservation(reservation);
        }

        if (dto.getCommandeRestaurantId() != null) {
            CommandeRestaurant commande = commandeRestaurantRepository.findById(dto.getCommandeRestaurantId())
                    .orElseThrow(() -> new RuntimeException("Commande restaurant non trouvée"));
            facture.setCommandeRestaurant(commande);
        }

        // Calculer les montants
        BigDecimal montantHT = BigDecimal.ZERO;
        for (LigneFactureDto ligneDto : dto.getLignes()) {
            BigDecimal montantLigneHT = ligneDto.getPrixUnitaire()
                    .multiply(BigDecimal.valueOf(ligneDto.getQuantite()));
            montantHT = montantHT.add(montantLigneHT);

            LigneFacture ligne = new LigneFacture();
            ligne.setFacture(facture);
            ligne.setDesignation(ligneDto.getDesignation());
            ligne.setDescription(ligneDto.getDescription());
            ligne.setQuantite(ligneDto.getQuantite());
            ligne.setPrixUnitaire(ligneDto.getPrixUnitaire());
            ligne.setMontantHT(montantLigneHT);

            facture.getLignes().add(ligne);
        }

        facture.setMontantHT(montantHT);
        facture.setTauxTVA(dto.getTauxTVA() != null ? dto.getTauxTVA() : BigDecimal.ZERO);

        BigDecimal montantTVA = montantHT.multiply(facture.getTauxTVA())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        facture.setMontantTVA(montantTVA);

        BigDecimal montantTTC = montantHT.add(montantTVA);
        facture.setMontantTTC(montantTTC);
        facture.setMontantPaye(BigDecimal.ZERO);
        facture.setMontantRestant(montantTTC);
        facture.setStatut(StatutFacture.BROUILLON);

        Facture saved = factureRepository.save(facture);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<FactureDto> getFacturesByHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return factureRepository.findByHotel(hotel).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public FactureDto emettre(Long factureId) {
        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        facture.setStatut(StatutFacture.EMISE);
        Facture saved = factureRepository.save(facture);
        return convertToDto(saved);
    }

    public FactureDto addPaiement(Long factureId, BigDecimal montant) {
        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        BigDecimal nouveauMontantPaye = facture.getMontantPaye().add(montant);
        facture.setMontantPaye(nouveauMontantPaye);
        facture.setMontantRestant(facture.getMontantTTC().subtract(nouveauMontantPaye));

        if (facture.getMontantRestant().compareTo(BigDecimal.ZERO) <= 0) {
            facture.setStatut(StatutFacture.PAYEE);
        }

        Facture saved = factureRepository.save(facture);
        return convertToDto(saved);
    }

    private String generateNumeroFacture() {
        String numero;
        do {
            numero = "FAC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (factureRepository.findByNumeroFacture(numero).isPresent());
        return numero;
    }

    private FactureDto convertToDto(Facture facture) {
        FactureDto dto = new FactureDto();
        dto.setId(facture.getId());
        dto.setNumeroFacture(facture.getNumeroFacture());
        dto.setDateEmission(facture.getDateEmission());
        dto.setDateEcheance(facture.getDateEcheance());
        dto.setStatut(facture.getStatut());

        if (facture.getClient() != null) {
            dto.setClientId(facture.getClient().getId());
            dto.setClientNom(facture.getClient().getNom() + " " + facture.getClient().getPrenom());
        }

        if (facture.getReservation() != null) {
            dto.setReservationId(facture.getReservation().getId());
            dto.setReservationNumero(facture.getReservation().getNumeroReservation());
        }

        if (facture.getCommandeRestaurant() != null) {
            dto.setCommandeRestaurantId(facture.getCommandeRestaurant().getId());
            dto.setCommandeRestaurantNumero(facture.getCommandeRestaurant().getNumeroCommande());
        }

        dto.setMontantHT(facture.getMontantHT());
        dto.setTauxTVA(facture.getTauxTVA());
        dto.setMontantTVA(facture.getMontantTVA());
        dto.setMontantTTC(facture.getMontantTTC());
        dto.setMontantPaye(facture.getMontantPaye());
        dto.setMontantRestant(facture.getMontantRestant());
        dto.setNotes(facture.getNotes());
        dto.setHotelId(facture.getHotel().getId());

        // Convertir les lignes
        List<LigneFactureDto> lignesDto = facture.getLignes().stream()
                .map(ligne -> {
                    LigneFactureDto ligneDto = new LigneFactureDto();
                    ligneDto.setId(ligne.getId());
                    ligneDto.setDesignation(ligne.getDesignation());
                    ligneDto.setDescription(ligne.getDescription());
                    ligneDto.setQuantite(ligne.getQuantite());
                    ligneDto.setPrixUnitaire(ligne.getPrixUnitaire());
                    ligneDto.setMontantHT(ligne.getMontantHT());
                    return ligneDto;
                })
                .collect(Collectors.toList());
        dto.setLignes(lignesDto);

        dto.setCreatedAt(facture.getCreatedAt());
        dto.setUpdatedAt(facture.getUpdatedAt());
        return dto;
    }
}