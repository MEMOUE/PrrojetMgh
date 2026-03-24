package com.mghbackend.service;

import com.mghbackend.dto.CommandeRestaurantDto;
import com.mghbackend.dto.LigneCommandeDto;
import com.mghbackend.entity.*;
import com.mghbackend.enums.StatutCommandeRestaurant;
import com.mghbackend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommandeRestaurantService {

    private final CommandeRestaurantRepository commandeRepository;
    private final ProduitRepository produitRepository;         // ← Produit (stock)
    private final ClientRepository clientRepository;
    private final ReservationRepository reservationRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final ProduitService produitService;
    private final TransactionHelper transactionHelper;// ← pour décrémenter le stock

    // ─────────────────────────────────────────────────────────────
    // Création d'une commande + décrémentation automatique du stock
    // ─────────────────────────────────────────────────────────────

    public CommandeRestaurantDto createCommande(Long hotelId,
                                                CommandeRestaurantDto dto,
                                                Long userId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));

        CommandeRestaurant commande = new CommandeRestaurant();
        commande.setHotel(hotel);
        commande.setNumeroCommande(generateNumeroCommande());
        commande.setNumeroTable(dto.getNumeroTable());
        commande.setNotes(dto.getNotes());

        // Client externe OU client de l'hôtel OU réservation
        if (dto.getNomClientExterne() != null && !dto.getNomClientExterne().isBlank()) {
            commande.setNomClientExterne(dto.getNomClientExterne());
            commande.setTelephoneClientExterne(dto.getTelephoneClientExterne());
        } else if (dto.getClientId() != null) {
            Client client = clientRepository.findById(dto.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));
            commande.setClient(client);
        } else if (dto.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(dto.getReservationId())
                    .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
            commande.setReservation(reservation);
        }

        if (userId != null) {
            userRepository.findById(userId).ifPresent(commande::setServeur);
        }

        // ── Lignes + calcul total + décrémentation stock ──────────
        BigDecimal montantTotal = BigDecimal.ZERO;

        for (LigneCommandeDto ligneDto : dto.getLignes()) {
            Produit produit = produitRepository.findById(ligneDto.getProduitId())
                    .orElseThrow(() -> new RuntimeException(
                            "Produit non trouvé : id=" + ligneDto.getProduitId()));

            if (!produit.getDisponible()) {
                throw new RuntimeException(
                        "Le produit '" + produit.getNom() + "' n'est pas disponible");
            }

            BigDecimal qte = BigDecimal.valueOf(ligneDto.getQuantite());

            // Vérification stock avant tout enregistrement
            if (produit.getQuantiteStock().compareTo(qte) < 0) {
                throw new RuntimeException(
                        "Stock insuffisant pour '" + produit.getNom() +
                                "'. Stock disponible : " + produit.getQuantiteStock() +
                                " " + produit.getUnite());
            }

            BigDecimal sousTotal = produit.getPrixUnitaire().multiply(qte);
            montantTotal = montantTotal.add(sousTotal);

            LigneCommande ligne = new LigneCommande();
            ligne.setCommande(commande);
            ligne.setProduit(produit);
            ligne.setQuantite(ligneDto.getQuantite());
            ligne.setPrixUnitaire(produit.getPrixUnitaire());
            ligne.setSousTotal(sousTotal);
            ligne.setNotes(ligneDto.getNotes());

            commande.getLignes().add(ligne);

            // ✅ Décrémentation automatique du stock
            produitService.ajusterStock(
                    produit.getId(),
                    qte,
                    com.mghbackend.enums.TypeMouvement.SORTIE,
                    "Commande restaurant " + commande.getNumeroCommande(),
                    userId
            );

            log.info("📦 Stock décrémenté : produit={}, qte={}, restant={}",
                    produit.getNom(), qte,
                    produit.getQuantiteStock().subtract(qte));
        }

        commande.setMontantTotal(montantTotal);
        commande.setStatut(StatutCommandeRestaurant.EN_ATTENTE);

        CommandeRestaurant saved = commandeRepository.save(commande);

        // ✅ Consolidation : ajouter le montant au total de la réservation liée
        if (commande.getReservation() != null) {
            majReservationMontant(commande.getReservation(), montantTotal);
            log.info("🔗 Commande {} rattachée à réservation {} — +{} FCFA ajoutés au total",
                    saved.getNumeroCommande(),
                    commande.getReservation().getNumeroReservation(),
                    montantTotal);
        }

        return convertToDto(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // Lecture
    // ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommandeRestaurantDto> getCommandesByHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return commandeRepository.findByHotel(hotel).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // Mises à jour
    // ─────────────────────────────────────────────────────────────

    public CommandeRestaurantDto updateStatut(Long commandeId,
                                              StatutCommandeRestaurant statut) {
        CommandeRestaurant commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        commande.setStatut(statut);

        if (statut == StatutCommandeRestaurant.SERVIE) {
            commande.setDateService(java.time.LocalDateTime.now());
        }

        // Si la commande est annulée → remettre le stock
        if (statut == StatutCommandeRestaurant.ANNULEE) {
            for (LigneCommande ligne : commande.getLignes()) {
                produitService.ajusterStock(
                        ligne.getProduit().getId(),
                        BigDecimal.valueOf(ligne.getQuantite()),
                        com.mghbackend.enums.TypeMouvement.RETOUR,
                        "Annulation commande " + commande.getNumeroCommande(),
                        null
                );
                log.info("♻️  Stock restitué suite annulation : produit={}",
                        ligne.getProduit().getNom());
            }

            // ✅ Retirer le montant de la réservation liée
            if (commande.getReservation() != null) {
                majReservationMontant(commande.getReservation(),
                        commande.getMontantTotal().negate());
                log.info("🔗 Annulation commande {} — -{} FCFA retirés de réservation {}",
                        commande.getNumeroCommande(),
                        commande.getMontantTotal(),
                        commande.getReservation().getNumeroReservation());
            }
        }

        CommandeRestaurant saved = commandeRepository.save(commande);
        if (statut == StatutCommandeRestaurant.PAYEE) {
            BigDecimal resteAPayer = commande.getMontantTotal()
                    .subtract(commande.getMontantPaye() != null ?
                            commande.getMontantPaye() : BigDecimal.ZERO);
            if (resteAPayer.compareTo(BigDecimal.ZERO) > 0) {
                transactionHelper.enregistrerPaiementRestaurant(
                        commande.getHotel().getId(),
                        commande.getId(),
                        commande.getNumeroCommande(),
                        resteAPayer
                );
            }
        }
        return convertToDto(saved);
    }

    public CommandeRestaurantDto addPaiement(Long commandeId, BigDecimal montant) {
        CommandeRestaurant commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        BigDecimal nouveauMontantPaye = commande.getMontantPaye().add(montant);
        commande.setMontantPaye(nouveauMontantPaye);

        if (nouveauMontantPaye.compareTo(commande.getMontantTotal()) >= 0) {
            commande.setStatut(StatutCommandeRestaurant.PAYEE);
        }

        CommandeRestaurant saved = commandeRepository.save(commande);
        transactionHelper.enregistrerPaiementRestaurant(
                commande.getHotel().getId(),
                commande.getId(),
                commande.getNumeroCommande(),
                montant
        );
        return convertToDto(saved);

    }

    // ─────────────────────────────────────────────────────────────
    // Utilitaires
    // ─────────────────────────────────────────────────────────────

    private String generateNumeroCommande() {
        String numero;
        do {
            numero = "CMD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (commandeRepository.findByNumeroCommande(numero).isPresent());
        return numero;
    }

    private CommandeRestaurantDto convertToDto(CommandeRestaurant commande) {
        CommandeRestaurantDto dto = new CommandeRestaurantDto();
        dto.setId(commande.getId());
        dto.setNumeroCommande(commande.getNumeroCommande());
        dto.setNomClientExterne(commande.getNomClientExterne());
        dto.setTelephoneClientExterne(commande.getTelephoneClientExterne());

        if (commande.getClient() != null) {
            dto.setClientId(commande.getClient().getId());
            dto.setClientNom(commande.getClient().getNom() + " " + commande.getClient().getPrenom());
        }

        if (commande.getReservation() != null) {
            dto.setReservationId(commande.getReservation().getId());
            dto.setReservationNumero(commande.getReservation().getNumeroReservation());
        }

        dto.setNumeroTable(commande.getNumeroTable());
        dto.setStatut(commande.getStatut());
        dto.setMontantTotal(commande.getMontantTotal());
        dto.setMontantPaye(commande.getMontantPaye());
        dto.setNotes(commande.getNotes());
        dto.setDateCommande(commande.getDateCommande());
        dto.setDateService(commande.getDateService());

        if (commande.getServeur() != null) {
            dto.setServeurId(commande.getServeur().getId());
            dto.setServeurNom(commande.getServeur().getFirstName() + " " +
                    commande.getServeur().getLastName());
        }

        dto.setHotelId(commande.getHotel().getId());

        // Lignes
        List<LigneCommandeDto> lignesDto = commande.getLignes().stream()
                .map(ligne -> {
                    LigneCommandeDto ligneDto = new LigneCommandeDto();
                    ligneDto.setId(ligne.getId());
                    ligneDto.setProduitId(ligne.getProduit().getId());
                    ligneDto.setProduitNom(ligne.getProduit().getNom());
                    ligneDto.setQuantite(ligne.getQuantite());
                    ligneDto.setPrixUnitaire(ligne.getPrixUnitaire());
                    ligneDto.setSousTotal(ligne.getSousTotal());
                    ligneDto.setNotes(ligne.getNotes());
                    return ligneDto;
                })
                .collect(Collectors.toList());
        dto.setLignes(lignesDto);

        dto.setCreatedAt(commande.getCreatedAt());
        dto.setUpdatedAt(commande.getUpdatedAt());
        return dto;
    }

    public CommandeRestaurantDto getCommandeById(Long id) {
        CommandeRestaurant commandeRestaurant = commandeRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Commande introuvable avec id: " + id));
        return convertToDto(commandeRestaurant);
    }

    /**
     * Met à jour le montantTotal et montantRestant de la réservation
     * lorsqu'une commande restaurant y est rattachée (ou annulée).
     *
     * @param reservation la réservation liée
     * @param montant     montant positif → ajout (nouvelle commande),
     *                    montant négatif → retrait (annulation commande)
     */
    private void majReservationMontant(Reservation reservation, BigDecimal montant) {
        BigDecimal nouveauTotal = reservation.getMontantTotal().add(montant);
        if (nouveauTotal.compareTo(BigDecimal.ZERO) < 0) {
            nouveauTotal = BigDecimal.ZERO;
        }

        reservation.setMontantTotal(nouveauTotal);

        BigDecimal nouveauRestant = nouveauTotal.subtract(
                reservation.getMontantPaye() != null ? reservation.getMontantPaye() : BigDecimal.ZERO);
        if (nouveauRestant.compareTo(BigDecimal.ZERO) < 0) {
            nouveauRestant = BigDecimal.ZERO;
        }
        reservation.setMontantRestant(nouveauRestant);

        // Recalcul du statut de paiement
        BigDecimal montantPaye = reservation.getMontantPaye() != null
                ? reservation.getMontantPaye() : BigDecimal.ZERO;

        if (nouveauRestant.compareTo(BigDecimal.ZERO) <= 0) {
            reservation.setStatutPaiement(com.mghbackend.enums.StatutPaiement.PAYE);
        } else if (montantPaye.compareTo(BigDecimal.ZERO) > 0) {
            reservation.setStatutPaiement(com.mghbackend.enums.StatutPaiement.ACOMPTE);
        } else {
            reservation.setStatutPaiement(com.mghbackend.enums.StatutPaiement.NON_PAYE);
        }

        reservationRepository.save(reservation);

        log.info("💰 Réservation {} mise à jour : total={}, restant={}, statut={}",
                reservation.getNumeroReservation(),
                nouveauTotal, nouveauRestant,
                reservation.getStatutPaiement());
    }
}