package com.mghbackend.service;

import com.mghbackend.dto.ClientDto;
import com.mghbackend.dto.request.CreateReservationRequest;
import com.mghbackend.dto.ReservationDto;
import com.mghbackend.entity.*;
import com.mghbackend.enums.*;
import com.mghbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChambreRepository chambreRepository;
    private final ClientRepository clientRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final ClientService clientService;

    public ReservationDto createReservation(Long hotelId, CreateReservationRequest request, Long userId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));

        Chambre chambre = chambreRepository.findById(request.getChambreId())
                .orElseThrow(() -> new RuntimeException("Chambre non trouvée"));

        if (!chambre.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Cette chambre n'appartient pas à cet hôtel");
        }

        // Vérifier les dates
        if (request.getDateArrivee().isAfter(request.getDateDepart())) {
            throw new RuntimeException("La date d'arrivée doit être avant la date de départ");
        }

        // Vérifier la disponibilité de la chambre
        List<Reservation> conflits = reservationRepository.findReservationsByChambreAndPeriode(
                chambre,
                request.getDateArrivee(),
                request.getDateDepart()
        );

        if (!conflits.isEmpty()) {
            throw new RuntimeException("La chambre n'est pas disponible pour cette période");
        }

        // Récupérer ou créer le client
        Client client;
        if (request.getClientId() != null) {
            client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        } else if (request.getNewClient() != null) {
            ClientDto clientDto = clientService.createClient(hotelId, request.getNewClient());
            client = clientRepository.findById(clientDto.getId())
                    .orElseThrow(() -> new RuntimeException("Erreur lors de la création du client"));
        } else {
            throw new RuntimeException("Client requis");
        }

        // Calculer le nombre de nuits et le montant
        long nombreNuits = ChronoUnit.DAYS.between(request.getDateArrivee(), request.getDateDepart());
        BigDecimal montantTotal = chambre.getPrixParNuit().multiply(BigDecimal.valueOf(nombreNuits));

        // Créer la réservation
        Reservation reservation = new Reservation();
        reservation.setNumeroReservation(generateNumeroReservation());
        reservation.setHotel(hotel);
        reservation.setChambre(chambre);
        reservation.setClient(client);
        reservation.setDateArrivee(request.getDateArrivee());
        reservation.setDateDepart(request.getDateDepart());
        reservation.setNombreNuits((int) nombreNuits);
        reservation.setNombreAdultes(request.getNombreAdultes());
        reservation.setNombreEnfants(request.getNombreEnfants() != null ? request.getNombreEnfants() : 0);
        reservation.setPrixParNuit(chambre.getPrixParNuit());
        reservation.setMontantTotal(montantTotal);
        reservation.setStatut(StatutReservation.CONFIRMEE);
        reservation.setNotes(request.getNotes());
        reservation.setDemandesSpeciales(request.getDemandesSpeciales());
        reservation.setReferenceExterne(request.getReferenceExterne());

        // Gérer le paiement
        if (request.getMontantPaye() != null && request.getMontantPaye().compareTo(BigDecimal.ZERO) > 0) {
            reservation.setMontantPaye(request.getMontantPaye());
            reservation.setMontantRestant(montantTotal.subtract(request.getMontantPaye()));

            if (request.getModePaiement() != null) {
                reservation.setModePaiement(ModePaiement.valueOf(request.getModePaiement()));
            }

            if (reservation.getMontantRestant().compareTo(BigDecimal.ZERO) <= 0) {
                reservation.setStatutPaiement(StatutPaiement.PAYE);
            } else {
                reservation.setStatutPaiement(StatutPaiement.ACOMPTE);
            }
        } else {
            reservation.setMontantPaye(BigDecimal.ZERO);
            reservation.setMontantRestant(montantTotal);
            reservation.setStatutPaiement(StatutPaiement.NON_PAYE);
        }

        // Associer l'employé qui crée la réservation
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            reservation.setCreatedBy(user);
        }

        // Mettre à jour le statut de la chambre
        if (request.getDateArrivee().equals(LocalDate.now())) {
            chambre.setStatut(StatutChambre.OCCUPEE);
        } else {
            chambre.setStatut(StatutChambre.RESERVEE);
        }
        chambreRepository.save(chambre);

        Reservation savedReservation = reservationRepository.save(reservation);
        return convertToDto(savedReservation);
    }

    @Transactional(readOnly = true)
    public ReservationDto getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
        return convertToDto(reservation);
    }

    @Transactional(readOnly = true)
    public ReservationDto getReservationByNumero(String numeroReservation) {
        Reservation reservation = reservationRepository.findByNumeroReservation(numeroReservation)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
        return convertToDto(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return reservationRepository.findByHotel(hotel).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByHotelAndStatut(Long hotelId, StatutReservation statut) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return reservationRepository.findByHotelAndStatut(hotel, statut).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByClient(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        return reservationRepository.findByClient(client).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getArrivalsForToday(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return reservationRepository.findArrivalsForToday(hotel, LocalDate.now()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getDeparturesForToday(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return reservationRepository.findDeparturesForToday(hotel, LocalDate.now()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsEnCours(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return reservationRepository.findReservationsEnCours(hotel).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsAVenir(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return reservationRepository.findReservationsAVenir(hotel, LocalDate.now()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> searchReservations(Long hotelId, String keyword) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hôtel non trouvé"));
        return reservationRepository.searchByHotelAndKeyword(hotel, keyword).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ReservationDto updateReservation(Long id, ReservationDto reservationDto) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (reservation.getStatut() == StatutReservation.ANNULEE) {
            throw new RuntimeException("Impossible de modifier une réservation annulée");
        }

        if (reservation.getStatut() == StatutReservation.TERMINEE) {
            throw new RuntimeException("Impossible de modifier une réservation terminée");
        }

        // Mettre à jour les informations modifiables
        reservation.setNotes(reservationDto.getNotes());
        reservation.setDemandesSpeciales(reservationDto.getDemandesSpeciales());

        if (reservationDto.getNombreAdultes() != null) {
            reservation.setNombreAdultes(reservationDto.getNombreAdultes());
        }
        if (reservationDto.getNombreEnfants() != null) {
            reservation.setNombreEnfants(reservationDto.getNombreEnfants());
        }

        Reservation updatedReservation = reservationRepository.save(reservation);
        return convertToDto(updatedReservation);
    }

    public ReservationDto doCheckin(Long id, Long userId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (reservation.getStatut() != StatutReservation.CONFIRMEE) {
            throw new RuntimeException("Seules les réservations confirmées peuvent faire l'objet d'un check-in");
        }

        reservation.setStatut(StatutReservation.EN_COURS);
        reservation.setDateCheckin(java.time.LocalDateTime.now());

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            reservation.setCheckinBy(user);
        }

        // Mettre à jour le statut de la chambre
        Chambre chambre = reservation.getChambre();
        chambre.setStatut(StatutChambre.OCCUPEE);
        chambreRepository.save(chambre);

        Reservation updatedReservation = reservationRepository.save(reservation);
        return convertToDto(updatedReservation);
    }

    public ReservationDto doCheckout(Long id, Long userId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (reservation.getStatut() != StatutReservation.EN_COURS) {
            throw new RuntimeException("Seules les réservations en cours peuvent faire l'objet d'un check-out");
        }

        reservation.setStatut(StatutReservation.TERMINEE);
        reservation.setDateCheckout(java.time.LocalDateTime.now());

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            reservation.setCheckoutBy(user);
        }

        // Mettre à jour le statut de la chambre
        Chambre chambre = reservation.getChambre();
        chambre.setStatut(StatutChambre.EN_NETTOYAGE);
        chambreRepository.save(chambre);

        Reservation updatedReservation = reservationRepository.save(reservation);
        return convertToDto(updatedReservation);
    }

    public void cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (reservation.getStatut() == StatutReservation.TERMINEE) {
            throw new RuntimeException("Impossible d'annuler une réservation terminée");
        }

        if (reservation.getStatut() == StatutReservation.EN_COURS) {
            throw new RuntimeException("Impossible d'annuler une réservation en cours. Effectuez d'abord un check-out.");
        }

        reservation.setStatut(StatutReservation.ANNULEE);

        // Libérer la chambre
        Chambre chambre = reservation.getChambre();
        chambre.setStatut(StatutChambre.DISPONIBLE);
        chambreRepository.save(chambre);

        reservationRepository.save(reservation);
    }

    public ReservationDto addPaiement(Long id, BigDecimal montant, String modePaiement) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Le montant doit être supérieur à 0");
        }

        BigDecimal nouveauMontantPaye = reservation.getMontantPaye().add(montant);
        BigDecimal nouveauMontantRestant = reservation.getMontantTotal().subtract(nouveauMontantPaye);

        if (nouveauMontantRestant.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Le montant payé dépasse le montant total");
        }

        reservation.setMontantPaye(nouveauMontantPaye);
        reservation.setMontantRestant(nouveauMontantRestant);

        if (modePaiement != null) {
            reservation.setModePaiement(ModePaiement.valueOf(modePaiement));
        }

        if (nouveauMontantRestant.compareTo(BigDecimal.ZERO) <= 0) {
            reservation.setStatutPaiement(StatutPaiement.PAYE);
        } else {
            reservation.setStatutPaiement(StatutPaiement.ACOMPTE);
        }

        Reservation updatedReservation = reservationRepository.save(reservation);
        return convertToDto(updatedReservation);
    }

    private String generateNumeroReservation() {
        String numero;
        do {
            numero = "RES" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (reservationRepository.existsByNumeroReservation(numero));
        return numero;
    }

    private ReservationDto convertToDto(Reservation reservation) {
        ReservationDto dto = new ReservationDto();
        dto.setId(reservation.getId());
        dto.setNumeroReservation(reservation.getNumeroReservation());
        dto.setChambreId(reservation.getChambre().getId());
        dto.setChambreNumero(reservation.getChambre().getNumero());
        dto.setClientId(reservation.getClient().getId());
        dto.setClientNom(reservation.getClient().getNom());
        dto.setClientPrenom(reservation.getClient().getPrenom());
        dto.setClientTelephone(reservation.getClient().getTelephone());
        dto.setHotelId(reservation.getHotel().getId());
        dto.setDateArrivee(reservation.getDateArrivee());
        dto.setDateDepart(reservation.getDateDepart());
        dto.setNombreNuits(reservation.getNombreNuits());
        dto.setNombreAdultes(reservation.getNombreAdultes());
        dto.setNombreEnfants(reservation.getNombreEnfants());
        dto.setPrixParNuit(reservation.getPrixParNuit());
        dto.setMontantTotal(reservation.getMontantTotal());
        dto.setMontantPaye(reservation.getMontantPaye());
        dto.setMontantRestant(reservation.getMontantRestant());
        dto.setStatut(reservation.getStatut());
        dto.setStatutPaiement(reservation.getStatutPaiement());
        dto.setModePaiement(reservation.getModePaiement());
        dto.setNotes(reservation.getNotes());
        dto.setDemandesSpeciales(reservation.getDemandesSpeciales());
        dto.setDateCheckin(reservation.getDateCheckin());
        dto.setDateCheckout(reservation.getDateCheckout());
        dto.setReferenceExterne(reservation.getReferenceExterne());

        if (reservation.getCreatedBy() != null) {
            dto.setCreatedById(reservation.getCreatedBy().getId());
            dto.setCreatedByName(reservation.getCreatedBy().getFirstName() + " " + reservation.getCreatedBy().getLastName());
        }

        if (reservation.getCheckinBy() != null) {
            dto.setCheckinById(reservation.getCheckinBy().getId());
            dto.setCheckinByName(reservation.getCheckinBy().getFirstName() + " " + reservation.getCheckinBy().getLastName());
        }

        if (reservation.getCheckoutBy() != null) {
            dto.setCheckoutById(reservation.getCheckoutBy().getId());
            dto.setCheckoutByName(reservation.getCheckoutBy().getFirstName() + " " + reservation.getCheckoutBy().getLastName());
        }

        dto.setCreatedAt(reservation.getCreatedAt());
        dto.setUpdatedAt(reservation.getUpdatedAt());

        return dto;
    }
}