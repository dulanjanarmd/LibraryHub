package com.sliit.library.repository;

import com.sliit.library.entity.User;
import com.sliit.library.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUserId(String userId);

    Optional<User> findByEmail(String email);

    boolean existsByUserId(String userId);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole role);

    Page<User> findByRole(UserRole role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.isActive = true AND " +
           "(LOWER(u.userId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'UNDERGRADUATE'")
    long countUndergraduates();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'POSTGRADUATE'")
    long countPostgraduates();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'FACULTY'")
    long countFaculty();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();
}
