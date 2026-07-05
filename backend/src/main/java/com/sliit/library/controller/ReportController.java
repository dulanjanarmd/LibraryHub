package com.sliit.library.controller;

import com.sliit.library.dto.*;
import com.sliit.library.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/admin/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/admin/reports/popular-books")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<List<PopularBookDTO>> getPopularBooks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reportService.getPopularBooks(limit));
    }

    @GetMapping("/admin/reports/overdue-items")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<List<OverdueItemDTO>> getOverdueItems() {
        return ResponseEntity.ok(reportService.getOverdueItems());
    }

    @GetMapping("/admin/reports/borrowing-by-faculty")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBorrowingByFaculty() {
        return ResponseEntity.ok(reportService.getBorrowingByFaculty());
    }

    @GetMapping("/admin/reports/user-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserActivityReport() {
        return ResponseEntity.ok(reportService.getUserActivityReport());
    }

    @GetMapping("/admin/reports/inventory")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<Map<String, Object>> getInventoryReport() {
        return ResponseEntity.ok(reportService.getInventoryReport());
    }

    @GetMapping("/admin/reports/fine-collection")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<Map<String, Object>> getFineCollectionReport() {
        return ResponseEntity.ok(reportService.getFineCollectionReport());
    }
}
