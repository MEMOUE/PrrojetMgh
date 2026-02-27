package com.mghbackend.service;

import com.mghbackend.entity.Transaction;
import com.mghbackend.enums.ModePaiementTransaction;
import com.mghbackend.enums.StatutTransaction;
import com.mghbackend.enums.TypeTransaction;
import com.mghbackend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;

/**
 * Service helper pour créer automatiquement des transactions financières
 * depuis d'autres modules (réservations, restaurant) sans dépendance circulaire.
 * Utilise directement le repository au lieu du TransactionService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionHelper {

    private final TransactionRepository transactionRepository;

    /**
     * Enregistre un paiement de réservation dans le module finance.
     * Statut = VALIDEE directement (la réception encaisse).
     */
    public void enregistrerPaiementReservation(Long hotelId,
                                               Long reservationId,
                                               String numeroReservation,
                                               String nomClient,
                                               BigDecimal montant,
                                               String modePaiement) {
        try {
            Transaction t = new Transaction();
            t.setHotelId(hotelId);
            t.setType(TypeTransaction.REVENU);
            t.setCategorie("Hébergement");
            t.setMontant(montant);
            t.setDateTransaction(LocalDateTime.now());
            t.setDescription("Paiement réservation " + numeroReservation + " – " + nomClient);
            t.setReservationId(reservationId);
            t.setNumeroPiece(numeroReservation);
            t.setStatut(StatutTransaction.VALIDEE);
            t.setValidePar("Système");
            t.setDateValidation(LocalDateTime.now());
            t.setReference(generateRef(hotelId));
            t.setCreatedByName("Système");

            if (modePaiement != null) {
                try {
                    t.setModePaiement(ModePaiementTransaction.valueOf(modePaiement));
                } catch (IllegalArgumentException ignored) {}
            }

            transactionRepository.save(t);
            log.info("✅ Transaction réservation créée : {} – {}F CFA", numeroReservation, montant);
        } catch (Exception e) {
            log.warn("⚠️ Impossible de créer transaction réservation {} : {}",
                    numeroReservation, e.getMessage());
        }
    }

    /**
     * Enregistre un paiement de commande restaurant dans le module finance.
     * Statut = VALIDEE directement.
     */
    public void enregistrerPaiementRestaurant(Long hotelId,
                                              Long commandeId,
                                              String numeroCommande,
                                              BigDecimal montant) {
        try {
            Transaction t = new Transaction();
            t.setHotelId(hotelId);
            t.setType(TypeTransaction.REVENU);
            t.setCategorie("Restaurant");
            t.setMontant(montant);
            t.setDateTransaction(LocalDateTime.now());
            t.setDescription("Paiement commande restaurant " + numeroCommande);
            t.setCommandeRestaurantId(commandeId);
            t.setNumeroPiece(numeroCommande);
            t.setStatut(StatutTransaction.VALIDEE);
            t.setValidePar("Système");
            t.setDateValidation(LocalDateTime.now());
            t.setReference(generateRef(hotelId));
            t.setCreatedByName("Système");

            transactionRepository.save(t);
            log.info("✅ Transaction restaurant créée : {} – {}F CFA", numeroCommande, montant);
        } catch (Exception e) {
            log.warn("⚠️ Impossible de créer transaction restaurant {} : {}",
                    numeroCommande, e.getMessage());
        }
    }

    /**
     * Génère une référence unique de type TRX-{année}-{count}.
     */
    private String generateRef(Long hotelId) {
        long count = transactionRepository.countByHotelId(hotelId) + 1;
        return String.format("TRX-%d-%05d", Year.now().getValue(), count);
    }
}