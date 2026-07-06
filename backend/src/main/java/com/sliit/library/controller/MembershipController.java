package com.sliit.library.controller;

import com.sliit.library.dto.MembershipRequest;
import com.sliit.library.dto.MembershipResponse;
import com.sliit.library.dto.MembershipReviewRequest;
import com.sliit.library.service.MembershipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class MembershipController {

    @Autowired
    private MembershipService membershipService;

    @PostMapping("/membership/apply")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY')")
    public ResponseEntity<MembershipResponse> apply(@Valid @RequestBody MembershipRequest request) {
        return ResponseEntity.ok(membershipService.applyForMembership(request));
    }

    @GetMapping("/membership/my")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MembershipResponse> getMyMembership() {
        return ResponseEntity.ok(membershipService.getMyMembership());
    }

    @GetMapping("/librarian/memberships/pending")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<MembershipResponse>> getPending() {
        return ResponseEntity.ok(membershipService.getPendingApplications());
    }

    @GetMapping("/librarian/memberships/all")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<MembershipResponse>> getAll() {
        return ResponseEntity.ok(membershipService.getAllMemberships());
    }

    @PostMapping("/librarian/memberships/{id}/review")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MembershipResponse> review(
            @PathVariable Long id,
            @RequestBody MembershipReviewRequest request) {
        return ResponseEntity.ok(membershipService.reviewMembership(id, request));
    }
}
