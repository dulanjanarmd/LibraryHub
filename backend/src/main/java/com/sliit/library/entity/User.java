package com.sliit.library.entity;

import com.sliit.library.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true, length = 20)
    private String userId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(length = 50)
    private String faculty;

    @Column(length = 100)
    private String programme;

    @Column(name = "max_loans", nullable = false)
    private Integer maxLoans;

    @Column(name = "loan_period_days", nullable = false)
    private Integer loanPeriodDays;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_mfa_enabled", nullable = false)
    private Boolean isMfaEnabled;

    @Column(name = "mfa_secret", length = 255)
    private String mfaSecret;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Transient
    public String getFullName() {
        return firstName + " " + lastName;
    }

    @PrePersist
    public void prePersist() {
        if (this.maxLoans == null) {
            this.maxLoans = this.role != null ? this.role.getDefaultMaxLoans() : 4;
        }
        if (this.loanPeriodDays == null) {
            this.loanPeriodDays = this.role != null ? this.role.getDefaultLoanPeriod() : 14;
        }
        if (this.isActive == null) this.isActive = true;
        if (this.isMfaEnabled == null) this.isMfaEnabled = false;
        if (this.emailVerified == null) this.emailVerified = false;
    }
}
