package com.sliit.library.controller;

import com.sliit.library.dto.ApiResponse;
import com.sliit.library.dto.FineDTO;
import com.sliit.library.dto.LoanDTO;
import com.sliit.library.dto.ReservationDTO;
import com.sliit.library.service.AuthService;
import com.sliit.library.service.FineService;
import com.sliit.library.service.LoanService;
import com.sliit.library.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "User dashboard data endpoints")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final AuthService authService;
    private final LoanService loanService;
    private final ReservationService reservationService;
    private final FineService fineService;

    @GetMapping("/summary")
    @Operation(summary = "Get user dashboard summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardSummary() {
        Long userId = authService.getCurrentUser().getId();

        List<LoanDTO> activeLoans = loanService.getActiveLoans(userId);
        List<ReservationDTO> pendingReservations = reservationService.getUserPendingReservations(userId);
        BigDecimal outstandingFines = fineService.getUserTotalUnpaidFines(userId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("activeLoans", activeLoans);
        summary.put("activeLoanCount", activeLoans.size());
        summary.put("pendingReservations", pendingReservations);
        summary.put("pendingReservationCount", pendingReservations.size());
        summary.put("outstandingFines", outstandingFines);
        summary.put("user", authService.getCurrentUser());

        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
