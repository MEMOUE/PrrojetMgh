package com.mghbackend.service;

import com.mghbackend.dto.CommandeRestaurantDto;
import com.mghbackend.dto.LigneCommandeDto;
import com.mghbackend.entity.*;
import com.mghbackend.enums.StatutCommandeRestaurant;
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
public class CommandeRestaurantService {

    private final CommandeRestaurantRepository commandeRepository;
    private final ProduitMenuRepository produitMenuRepository;
    private final ClientRepository clientRepository;
    private final ReservationRepository reservationRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final LigneCommandeRepository ligneCommandeRepository;

    public CommandeRestaurantDto createCommande(Long hotelId, CommandeRestaurantDto dto, Long userId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));

        CommandeRestaurant commande = new CommandeRestaurant();
        commande.setHotel(hotel);
        commande.setNumeroCommande(generateNumeroCommande());
        commande.setNumeroTable(dto.getNumeroTable());
        commande.setNotes(dto.getNotes());

        // Client externe OU client de l'hôtel OU réservation
        if (dto.getNomClientExterne() != null && !dto.getNomClientExterne().isEmpty()) {
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
            User user = userRepository.findById(userId).orElse(null);
            commande.setServeur(user);
        }

        // Calculer le montant total
        BigDecimal montantTotal = BigDecimal.ZERO;
        for (LigneCommandeDto ligneDto : dto.getLignes()) {
            ProduitMenu produitMenu = produitMenuRepository.findById(ligneDto.getProduitMenuId())
                    .orElseThrow(() -> new RuntimeException("Produit menu non trouvé: " + ligneDto.getProduitMenuId()));

            BigDecimal sousTotal = produitMenu.getPrix().multiply(BigDecimal.valueOf(ligneDto.getQuantite()));
            montantTotal = montantTotal.add(sousTotal);

            LigneCommande ligne = new LigneCommande();
            ligne.setCommande(commande);
            ligne.setProduitMenu(produitMenu);
            ligne.setQuantite(ligneDto.getQuantite());
            ligne.setPrixUnitaire(produitMenu.getPrix());
            ligne.setSousTotal(sousTotal);
            ligne.setNotes(ligneDto.getNotes());

            commande.getLignes().add(ligne);
        }

        commande.setMontantTotal(montantTotal);
        commande.setStatut(StatutCommandeRestaurant.EN_ATTENTE);

        CommandeRestaurant saved = commandeRepository.save(commande);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CommandeRestaurantDto> getCommandesByHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return commandeRepository.findByHotel(hotel).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CommandeRestaurantDto updateStatut(Long commandeId, StatutCommandeRestaurant statut) {
        CommandeRestaurant commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        commande.setStatut(statut);

        if (statut == StatutCommandeRestaurant.SERVIE) {
            commande.setDateService(java.time.LocalDateTime.now());
        }

        CommandeRestaurant saved = commandeRepository.save(commande);
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
        return convertToDto(saved);
    }

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
            dto.setServeurNom(commande.getServeur().getFirstName() + " " + commande.getServeur().getLastName());
        }

        dto.setHotelId(commande.getHotel().getId());

        // Convertir les lignes
        List<LigneCommandeDto> lignesDto = commande.getLignes().stream()
                .map(ligne -> {
                    LigneCommandeDto ligneDto = new LigneCommandeDto();
                    ligneDto.setId(ligne.getId());
                    ligneDto.setProduitMenuId(ligne.getProduitMenu().getId());
                    ligneDto.setProduitMenuNom(ligne.getProduitMenu().getNom());
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
}