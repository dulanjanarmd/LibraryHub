package com.sliit.library.controller;

import com.sliit.library.dto.ApiResponse;
import com.sliit.library.entity.MembershipApplication;
import com.sliit.library.service.AuthService;
import com.sliit.library.service.MembershipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership")
@RequiredArgsConstructor
@Tag(name = "Membership", description = "Membership application and approval")
@SecurityRequirement(name = "bearerAuth")
public class MembershipController {

    private final MembershipService membershipService;
    private final AuthService authService;

    @PostMapping("/apply")
    @Operation(summary = "Apply for membership")
    public ResponseEntity<ApiResponse<MembershipApplication>> apply(
            @Valid @RequestBody MembershipApplication application) {
        var user = authService.getCurrentUser();
        var saved = membershipService.applyForMembership(user, application);
        return ResponseEntity.ok(ApiResponse.success(saved, "Application submitted"));
    }

    @GetMapping("/pending")
    @Operation(summary = "List pending membership applications (librarian/admin only)")
    public ResponseEntity<ApiResponse<List<MembershipApplication>>> pending() {
        var list = membershipService.getPendingApplications();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve a membership application (librarian/admin)")
    public ResponseEntity<ApiResponse<MembershipApplication>> approve(@PathVariable Long id) {
        var librarian = authService.getCurrentUser();
        var app = membershipService.approveApplication(id, librarian);
        return ResponseEntity.ok(ApiResponse.success(app, "Application approved"));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a membership application (librarian/admin)")
    public ResponseEntity<ApiResponse<MembershipApplication>> reject(@PathVariable Long id,
            @RequestParam(required = false) String reason) {
        var librarian = authService.getCurrentUser();
        var app = membershipService.rejectApplication(id, librarian, reason);
        return ResponseEntity.ok(ApiResponse.success(app, "Application rejected"));
    }
}
