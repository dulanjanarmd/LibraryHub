package com.sliit.library.controller;

import com.sliit.library.dto.ApiResponse;
import com.sliit.library.dto.CirculationRequest;
import com.sliit.library.dto.LoanDTO;
import com.sliit.library.entity.enums.LoanStatus;
import com.sliit.library.service.AuthService;
import com.sliit.library.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Loans & Circulation", description = "Book loan and circulation management")
@SecurityRequirement(name = "bearerAuth")
public class LoanController {

    private final LoanService loanService;
    private final AuthService authService;

    // User endpoints
    @GetMapping("/loans/my-loans")
    @Operation(summary = "Get current user's loans")
    public ResponseEntity<ApiResponse<List<LoanDTO>>> getMyLoans(
            @RequestParam(required = false) LoanStatus status) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(loanService.getUserLoans(userId, status)));
    }

    @GetMapping("/loans/my-active")
    @Operation(summary = "Get current user's active loans")
    public ResponseEntity<ApiResponse<List<LoanDTO>>> getMyActiveLoans() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(loanService.getActiveLoans(userId)));
    }

    @PostMapping("/loans/{loanId}/renew")
    @Operation(summary = "Renew a loan")
    public ResponseEntity<ApiResponse<LoanDTO>> renewLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(ApiResponse.success(loanService.renewLoan(loanId), "Loan renewed successfully"));
    }

    // Admin/Librarian endpoints
    @PostMapping("/circulation/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Issue a book to a user (Librarian only)")
    public ResponseEntity<ApiResponse<LoanDTO>> issueBook(@RequestBody CirculationRequest request) {
        Long issuedById = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                loanService.issueBook(request.getUserId(), request.getAccessionNumber(), issuedById),
                "Book issued successfully"));
    }

    @PostMapping("/circulation/return/{loanId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Process a book return (Librarian only)")
    public ResponseEntity<ApiResponse<LoanDTO>> returnBook(@PathVariable Long loanId) {
        return ResponseEntity.ok(ApiResponse.success(
                loanService.returnBook(loanId), "Book returned successfully"));
    }

    @GetMapping("/circulation/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get all overdue loans (Librarian only)")
    public ResponseEntity<ApiResponse<List<LoanDTO>>> getOverdueLoans() {
        return ResponseEntity.ok(ApiResponse.success(loanService.getAllOverdueLoans()));
    }

    @GetMapping("/admin/loans/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get loans by user ID (Admin/Librarian only)")
    public ResponseEntity<ApiResponse<List<LoanDTO>>> getUserLoansByAdmin(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getUserLoans(userId, null)));
    }
}
