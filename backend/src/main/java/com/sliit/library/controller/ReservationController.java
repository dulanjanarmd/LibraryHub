package com.sliit.library.controller;

import com.sliit.library.dto.ApiResponse;
import com.sliit.library.dto.ReservationDTO;
import com.sliit.library.service.AuthService;
import com.sliit.library.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Book reservation management")
@SecurityRequirement(name = "bearerAuth")
public class ReservationController {

    private final ReservationService reservationService;
    private final AuthService authService;

    @GetMapping("/my-reservations")
    @Operation(summary = "Get current user's reservations")
    public ResponseEntity<ApiResponse<List<ReservationDTO>>> getMyReservations() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(reservationService.getUserReservations(userId)));
    }

    @GetMapping("/my-pending")
    @Operation(summary = "Get current user's pending reservations")
    public ResponseEntity<ApiResponse<List<ReservationDTO>>> getMyPendingReservations() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(reservationService.getUserPendingReservations(userId)));
    }

    @PostMapping("/book/{bookId}")
    @Operation(summary = "Create a reservation for a book")
    public ResponseEntity<ApiResponse<ReservationDTO>> createReservation(@PathVariable Long bookId) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.createReservation(userId, bookId), "Reservation created successfully"));
    }

    @PostMapping("/{reservationId}/cancel")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> cancelReservation(
            @PathVariable Long reservationId,
            @RequestParam(required = false) String reason) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.cancelReservation(reservationId, userId, reason), "Reservation cancelled"));
    }
}
