package com.mghbackend.controller;

import com.mghbackend.dto.reponse.ApiResponse;
import com.mghbackend.dto.request.CreateReservationRequest;
import com.mghbackend.dto.ReservationDto;
import com.mghbackend.enums.StatutReservation;
import com.mghbackend.security.CustomUserPrincipal;
import com.mghbackend.service.ReservationService;
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
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_CREER_RESERVATION')")
    public ResponseEntity<ApiResponse<ReservationDto>> createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            ReservationDto reservation = reservationService.createReservation(
                    principal.getHotelId(),
                    request,
                    principal.getAccountType().equals("USER") ? principal.getId() : null
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Réservation créée avec succès", reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<ReservationDto>> getReservation(@PathVariable Long id) {
        try {
            ReservationDto reservation = reservationService.getReservationById(id);
            return ResponseEntity.ok(ApiResponse.success(reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/numero/{numero}")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<ReservationDto>> getReservationByNumero(@PathVariable String numero) {
        try {
            ReservationDto reservation = reservationService.getReservationByNumero(numero);
            return ResponseEntity.ok(ApiResponse.success(reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getReservations(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ReservationDto> reservations = reservationService.getReservationsByHotel(principal.getHotelId());
            return ResponseEntity.ok(ApiResponse.success(reservations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getReservationsByStatut(
            @PathVariable StatutReservation statut,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ReservationDto> reservations = reservationService.getReservationsByHotelAndStatut(
                    principal.getHotelId(),
                    statut
            );
            return ResponseEntity.ok(ApiResponse.success(reservations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getReservationsByClient(@PathVariable Long clientId) {
        try {
            List<ReservationDto> reservations = reservationService.getReservationsByClient(clientId);
            return ResponseEntity.ok(ApiResponse.success(reservations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/arrivees-aujourdhui")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getArriveesAujourdhui(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ReservationDto> reservations = reservationService.getArrivalsForToday(principal.getHotelId());
            return ResponseEntity.ok(ApiResponse.success(reservations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/departs-aujourdhui")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getDepartsAujourdhui(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ReservationDto> reservations = reservationService.getDeparturesForToday(principal.getHotelId());
            return ResponseEntity.ok(ApiResponse.success(reservations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/en-cours")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getReservationsEnCours(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ReservationDto> reservations = reservationService.getReservationsEnCours(principal.getHotelId());
            return ResponseEntity.ok(ApiResponse.success(reservations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/a-venir")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getReservationsAVenir(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ReservationDto> reservations = reservationService.getReservationsAVenir(principal.getHotelId());
            return ResponseEntity.ok(ApiResponse.success(reservations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_VOIR_RESERVATIONS')")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> searchReservations(
            @RequestParam String keyword,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            List<ReservationDto> reservations = reservationService.searchReservations(
                    principal.getHotelId(),
                    keyword
            );
            return ResponseEntity.ok(ApiResponse.success(reservations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_MODIFIER_RESERVATION')")
    public ResponseEntity<ApiResponse<ReservationDto>> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationDto reservationDto) {
        try {
            ReservationDto reservation = reservationService.updateReservation(id, reservationDto);
            return ResponseEntity.ok(ApiResponse.success("Réservation mise à jour avec succès", reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/checkin")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_MODIFIER_RESERVATION')")
    public ResponseEntity<ApiResponse<ReservationDto>> doCheckin(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            ReservationDto reservation = reservationService.doCheckin(
                    id,
                    principal.getAccountType().equals("USER") ? principal.getId() : null
            );
            return ResponseEntity.ok(ApiResponse.success("Check-in effectué avec succès", reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_MODIFIER_RESERVATION')")
    public ResponseEntity<ApiResponse<ReservationDto>> doCheckout(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            ReservationDto reservation = reservationService.doCheckout(
                    id,
                    principal.getAccountType().equals("USER") ? principal.getId() : null
            );
            return ResponseEntity.ok(ApiResponse.success("Check-out effectué avec succès", reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_ANNULER_RESERVATION')")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(@PathVariable Long id) {
        try {
            reservationService.cancelReservation(id);
            return ResponseEntity.ok(ApiResponse.success("Réservation annulée avec succès", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/paiement")
    @PreAuthorize("hasRole('HOTEL') or hasAuthority('PERMISSION_MODIFIER_RESERVATION')")
    public ResponseEntity<ApiResponse<ReservationDto>> addPaiement(
            @PathVariable Long id,
            @RequestParam BigDecimal montant,
            @RequestParam String modePaiement) {
        try {
            ReservationDto reservation = reservationService.addPaiement(id, montant, modePaiement);
            return ResponseEntity.ok(ApiResponse.success("Paiement enregistré avec succès", reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}