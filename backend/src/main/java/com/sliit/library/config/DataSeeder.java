package com.sliit.library.config;

import com.sliit.library.entity.User;
import com.sliit.library.entity.enums.UserRole;
import com.sliit.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
    }

    private void seedUsers() {
        if (!userRepository.existsByUserId("IT20234567")) {
            userRepository.save(User.builder()
                    .userId("IT20234567").email("samantha.t@sliit.lk")
                    .passwordHash(passwordEncoder.encode("student123"))
                    .firstName("Samantha").lastName("Thilakarathne")
                    .phone("+94771234567").role(UserRole.UNDERGRADUATE)
                    .faculty("Computing").programme("BSc (Hons) in Information Technology")
                    .maxLoans(4).loanPeriodDays(14)
                    .isActive(true).isMfaEnabled(false).emailVerified(true).build());
            log.info("Seeded: IT20234567");
        }
        if (!userRepository.existsByUserId("PG20230078")) {
            userRepository.save(User.builder()
                    .userId("PG20230078").email("dinesh.k@sliit.lk")
                    .passwordHash(passwordEncoder.encode("pg123"))
                    .firstName("Dinesh").lastName("Kumar")
                    .phone("+94777654321").role(UserRole.POSTGRADUATE)
                    .faculty("Computing").programme("MSc in Computer Science")
                    .maxLoans(6).loanPeriodDays(21)
                    .isActive(true).isMfaEnabled(false).emailVerified(true).build());
            log.info("Seeded: PG20230078");
        }
        if (!userRepository.existsByUserId("ST20210045")) {
            userRepository.save(User.builder()
                    .userId("ST20210045").email("nimal.f@sliit.lk")
                    .passwordHash(passwordEncoder.encode("faculty123"))
                    .firstName("Nimal").lastName("Fernando")
                    .phone("+94712233445").role(UserRole.FACULTY)
                    .faculty("Computing").programme("Department of Computer Science")
                    .maxLoans(10).loanPeriodDays(30)
                    .isActive(true).isMfaEnabled(false).emailVerified(true).build());
            log.info("Seeded: ST20210045");
        }
        if (!userRepository.existsByUserId("LIB001")) {
            userRepository.save(User.builder()
                    .userId("LIB001").email("librarian@sliit.lk")
                    .passwordHash(passwordEncoder.encode("lib123"))
                    .firstName("Priya").lastName("Wickramasinghe")
                    .phone("+94719988776").role(UserRole.LIBRARIAN)
                    .faculty("Library Services").programme("Library and Information Science")
                    .maxLoans(20).loanPeriodDays(30)
                    .isActive(true).isMfaEnabled(false).emailVerified(true).build());
            log.info("Seeded: LIB001");
        }
        if (!userRepository.existsByUserId("ADMIN001")) {
            userRepository.save(User.builder()
                    .userId("ADMIN001").email("admin@sliit.lk")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .firstName("Library").lastName("Administrator")
                    .phone("+94711122334").role(UserRole.ADMIN)
                    .faculty("Library Administration").programme("Library Management")
                    .maxLoans(50).loanPeriodDays(60)
                    .isActive(true).isMfaEnabled(false).emailVerified(true).build());
            log.info("Seeded: ADMIN001");
        }
        log.info("Data seeding complete.");
    }
}