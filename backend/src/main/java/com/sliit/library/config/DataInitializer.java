package com.sliit.library.config;

import com.sliit.library.entity.Role;
import com.sliit.library.entity.User;
import com.sliit.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            userRepository.saveAll(List.of(
                User.builder()
                    .email("admin@example.com")
                    .role(Role.ADMIN)
                    .fullName("System Admin")
                    .studentStaffId("ADMIN001")
                    .phoneNumber("0771234567")
                    .password(passwordEncoder.encode("password"))
                    .isActive(true)
                    .currentBorrowCount(0)
                    .outstandingFine(0.0)
                    .build(),

                User.builder()
                    .email("librarian@example.com")
                    .role(Role.LIBRARIAN)
                    .fullName("Head Librarian")
                    .studentStaffId("LIB001")
                    .phoneNumber("0771234568")
                    .password(passwordEncoder.encode("password"))
                    .isActive(true)
                    .currentBorrowCount(0)
                    .outstandingFine(0.0)
                    .build(),

                User.builder()
                    .email("student@example.com")
                    .role(Role.STUDENT)
                    .fullName("Demo Student")
                    .studentStaffId("IT12345678")
                    .phoneNumber("0771234569")
                    .faculty("Computing")
                    .programme("BSc IT")
                    .password(passwordEncoder.encode("password"))
                    .isActive(true)
                    .currentBorrowCount(0)
                    .outstandingFine(0.0)
                    .build(),

                User.builder()
                    .email("faculty@example.com")
                    .role(Role.FACULTY)
                    .fullName("Demo Faculty")
                    .studentStaffId("FAC001")
                    .phoneNumber("0771234570")
                    .faculty("Computing")
                    .password(passwordEncoder.encode("password"))
                    .isActive(true)
                    .currentBorrowCount(0)
                    .outstandingFine(0.0)
                    .build()
            ));
        }
    }
}
