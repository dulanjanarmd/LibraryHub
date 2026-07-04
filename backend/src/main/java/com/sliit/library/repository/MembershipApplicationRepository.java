package com.sliit.library.repository;

import com.sliit.library.entity.MembershipApplication;
import com.sliit.library.entity.enums.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MembershipApplicationRepository extends JpaRepository<MembershipApplication, Long> {
    List<MembershipApplication> findByStatus(MembershipStatus status);
}
