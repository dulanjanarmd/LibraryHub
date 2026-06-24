package com.sliit.library.service;

import com.sliit.library.dto.UserDTO;
import com.sliit.library.entity.User;
import com.sliit.library.entity.enums.UserRole;
import com.sliit.library.exception.LibraryException;
import com.sliit.library.repository.FineRepository;
import com.sliit.library.repository.LoanRepository;
import com.sliit.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> LibraryException.notFound("User", id.toString()));
        return mapToDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByUserId(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> LibraryException.notFound("User", userId));
        return mapToDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers(int page, int size, String query) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users;
        if (query != null && !query.isBlank()) {
            users = userRepository.searchUsers(query, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.getContent().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO createUser(UserDTO dto) {
        if (userRepository.existsByUserId(dto.getUserId())) {
            throw LibraryException.conflict("User ID already exists: " + dto.getUserId());
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw LibraryException.conflict("Email already registered: " + dto.getEmail());
        }

        User user = User.builder()
                .userId(dto.getUserId())
                .email(dto.getEmail())
                .passwordHash(authService.encodePassword(dto.getPassword()))
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phone(dto.getPhone())
                .role(dto.getRole())
                .faculty(dto.getFaculty())
                .programme(dto.getProgramme())
                .isActive(true)
                .emailVerified(false)
                .build();

        User saved = userRepository.save(user);
        log.info("User created: {} ({})", saved.getUserId(), saved.getRole());
        return mapToDTO(saved);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> LibraryException.notFound("User", id.toString()));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getFaculty() != null) user.setFaculty(dto.getFaculty());
        if (dto.getProgramme() != null) user.setProgramme(dto.getProgramme());
        if (dto.getMaxLoans() != null) user.setMaxLoans(dto.getMaxLoans());
        if (dto.getLoanPeriodDays() != null) user.setLoanPeriodDays(dto.getLoanPeriodDays());
        if (dto.getIsActive() != null) user.setIsActive(dto.getIsActive());

        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }

    @Transactional
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> LibraryException.notFound("User", id.toString()));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
        log.info("User {} status toggled to {}", id, user.getIsActive());
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentUserProfile() {
        User user = authService.getCurrentUser();
        return mapToDTO(user);
    }

    private UserDTO mapToDTO(User user) {
        long activeLoans = loanRepository.countActiveLoansByUser(user.getId());
        BigDecimal totalFines = fineRepository.getTotalUnpaidFinesByUser(user.getId());

        return UserDTO.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .faculty(user.getFaculty())
                .programme(user.getProgramme())
                .maxLoans(user.getMaxLoans())
                .loanPeriodDays(user.getLoanPeriodDays())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .activeLoans((int) activeLoans)
                .totalFines(totalFines != null ? totalFines.intValue() : 0)
                .build();
    }
}
