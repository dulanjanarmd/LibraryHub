package com.sliit.library.controller;

import com.sliit.library.dto.ApiResponse;
import com.sliit.library.dto.FineDTO;
import com.sliit.library.entity.enums.PaymentMethod;
import com.sliit.library.service.AuthService;
import com.sliit.library.service.FineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/fines")
@RequiredArgsConstructor
@Tag(name = "Fines", description = "Fine management and payment endpoints")
@SecurityRequirement(name = "bearerAuth")
public class FineController {

    private final FineService fineService;
    private final AuthService authService;

    @GetMapping("/my-fines")
    @Operation(summary = "Get current user's fines")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getMyFines() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(fineService.getUserFines(userId)));
    }

    @GetMapping("/my-unpaid")
    @Operation(summary = "Get current user's unpaid fines")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getMyUnpaidFines() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(fineService.getUserUnpaidFines(userId)));
    }

    @GetMapping("/my-total")
    @Operation(summary = "Get current user's total unpaid fines amount")
    public ResponseEntity<ApiResponse<BigDecimal>> getMyTotalUnpaidFines() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(fineService.getUserTotalUnpaidFines(userId)));
    }

    @PostMapping("/{fineId}/pay")
    @Operation(summary = "Pay a fine")
    public ResponseEntity<ApiResponse<FineDTO>> payFine(
            @PathVariable Long fineId,
            @RequestParam BigDecimal amount,
            @RequestParam(defaultValue = "ONLINE") PaymentMethod method) {
        return ResponseEntity.ok(ApiResponse.success(
                fineService.payFine(fineId, amount, method), "Payment processed successfully"));
    }

    // Admin endpoints
    @GetMapping("/unpaid")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get all unpaid fines (Admin/Librarian only)")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getAllUnpaidFines() {
        return ResponseEntity.ok(ApiResponse.success(fineService.getAllUnpaidFines()));
    }

    @PostMapping("/{fineId}/waive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Waive a fine (Admin only)")
    public ResponseEntity<ApiResponse<FineDTO>> waiveFine(
            @PathVariable Long fineId,
            @RequestParam String reason) {
        Long adminId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                fineService.waiveFine(fineId, reason, adminId), "Fine waived successfully"));
    }

    @GetMapping("/revenue/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get monthly fine revenue (Admin/Librarian only)")
    public ResponseEntity<ApiResponse<BigDecimal>> getMonthlyRevenue() {
        return ResponseEntity.ok(ApiResponse.success(fineService.getMonthlyRevenue()));
    }
}
