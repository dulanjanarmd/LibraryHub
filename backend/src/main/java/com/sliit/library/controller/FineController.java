package com.sliit.library.controller;

import com.sliit.library.dto.*;
import com.sliit.library.entity.User;
import com.sliit.library.repository.UserRepository;
import com.sliit.library.security.UserDetailsImpl;
import com.sliit.library.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class FineController {

    @Autowired
    private FineService fineService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/fines/user/{userId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<FineResponse>> getUserFines(@PathVariable Long userId) {
        return ResponseEntity.ok(fineService.getUserFines(userId));
    }

    @GetMapping("/fines/user/{userId}/unpaid")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<FineResponse>> getUnpaidFines(@PathVariable Long userId) {
        return ResponseEntity.ok(fineService.getUnpaidFines(userId));
    }

    @PostMapping("/fines/pay")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> payFine(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(fineService.payFine(request));
    }

    @GetMapping("/librarian/fines/all")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<FineResponse>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }

    @GetMapping("/librarian/fines/unpaid")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<FineResponse>> getAllUnpaidFines() {
        return ResponseEntity.ok(fineService.getAllUnpaidFines());
    }

    @PostMapping("/admin/fines/{fineId}/waive")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<MessageResponse> waiveFine(
            @PathVariable Long fineId,
            @RequestParam Double amount,
            @RequestParam String reason) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User admin = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(fineService.waiveFine(fineId, amount, reason, admin));
    }

    @GetMapping("/librarian/fines/stats")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Double>> getFineStats() {
        return ResponseEntity.ok(Map.of(
                "totalOutstanding", fineService.getTotalOutstandingFines(),
                "totalCollected", fineService.getTotalCollectedFines()
        ));
    }
}
