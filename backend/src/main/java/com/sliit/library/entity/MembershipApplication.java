package com.sliit.library.entity;

import com.sliit.library.entity.enums.MembershipStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "membership_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "applicant_id", referencedColumnName = "id", columnDefinition = "BIGINT")
    private User user;

    private String fullName;
    private String email;
    private String phone;
    private String faculty;
    private String programme;
    private String userIdentifier;

    @Enumerated(EnumType.STRING)
    private MembershipStatus status;

    private String librarianNotes;

    @CreationTimestamp
    private LocalDateTime submittedAt;
}
