package com.sliit.library.controller;

import com.sliit.library.dto.ApiResponse;
import com.sliit.library.repository.*;
import com.sliit.library.service.BookService;
import com.sliit.library.service.FineService;
import com.sliit.library.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
@Tag(name = "Admin", description = "Administrative dashboard and reporting endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final UserRepository userRepository;
    private final BookService bookService;
    private final LoanService loanService;
    private final FineService fineService;

    @GetMapping("/overview")
    @Operation(summary = "Get admin dashboard overview stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalBooks", bookRepository.countActiveBooks());
        stats.put("totalActiveLoans", loanRepository.countAllActiveLoans());
        stats.put("overdueLoans", loanRepository.countOverdueLoans(LocalDateTime.now()));
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countActiveUsers());
        stats.put("undergraduates", userRepository.countUndergraduates());
        stats.put("postgraduates", userRepository.countPostgraduates());
        stats.put("faculty", userRepository.countFaculty());
        stats.put("monthlyFineRevenue", fineService.getMonthlyRevenue());
        stats.put("unpaidFines", fineRepository.countUnpaidFines());

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/recent-loans")
    @Operation(summary = "Get recent loan transactions")
    public ResponseEntity<ApiResponse<?>> getRecentLoans() {
        var recent = loanService.getAllOverdueLoans();
        return ResponseEntity.ok(ApiResponse.success(recent));
    }

    @GetMapping("/fine-stats")
    @Operation(summary = "Get fine statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFineStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("unpaidFines", fineRepository.countUnpaidFines());
        stats.put("monthlyRevenue", fineService.getMonthlyRevenue());
        stats.put("totalUnpaidAmount", fineRepository.findByIsPaidFalse().stream()
                .map(f -> f.getBalanceLkr())
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
