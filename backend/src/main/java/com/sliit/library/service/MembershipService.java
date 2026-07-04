package com.sliit.library.service;

import com.sliit.library.entity.MembershipApplication;
import com.sliit.library.entity.User;
import com.sliit.library.entity.enums.MembershipStatus;
import com.sliit.library.exception.LibraryException;
import com.sliit.library.repository.MembershipApplicationRepository;
import com.sliit.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipService {

    private final MembershipApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Transactional
    public MembershipApplication applyForMembership(User user, MembershipApplication application) {
        // attach user and mark user's membership status
        application.setUser(user);
        application.setStatus(MembershipStatus.PENDING);
        var saved = applicationRepository.save(application);
        user.setMembershipStatus(MembershipStatus.PENDING);
        userRepository.save(user);
        log.info("User {} applied for membership (application {})", user.getUserId(), saved.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<MembershipApplication> getPendingApplications() {
        return applicationRepository.findByStatus(MembershipStatus.PENDING);
    }

    @Transactional
    public MembershipApplication approveApplication(Long applicationId, User librarian) {
        MembershipApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> LibraryException.notFound("MembershipApplication", String.valueOf(applicationId)));
        if (app.getStatus() != MembershipStatus.PENDING) {
            throw LibraryException.validation("Application is not pending");
        }
        // set membership on user
        User user = app.getUser();
        if (user == null)
            throw LibraryException.notFound("User", "<unknown>");
        user.setIsMember(true);
        user.setMembershipStatus(MembershipStatus.APPROVED);
        user.setMembershipId(generateMembershipId(user));
        userRepository.save(user);

        app.setStatus(MembershipStatus.APPROVED);
        app.setLibrarianNotes("Approved by " + librarian.getUserId());
        applicationRepository.save(app);
        log.info("Membership application {} approved for user {}", applicationId, user.getUserId());
        return app;
    }

    @Transactional
    public MembershipApplication rejectApplication(Long applicationId, User librarian, String reason) {
        MembershipApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> LibraryException.notFound("MembershipApplication", String.valueOf(applicationId)));
        if (app.getStatus() != MembershipStatus.PENDING) {
            throw LibraryException.validation("Application is not pending");
        }
        app.setStatus(MembershipStatus.REJECTED);
        app.setLibrarianNotes(reason != null ? reason : "Rejected by " + librarian.getUserId());
        applicationRepository.save(app);
        User user = app.getUser();
        if (user != null) {
            user.setMembershipStatus(MembershipStatus.REJECTED);
            userRepository.save(user);
        }
        log.info("Membership application {} rejected", applicationId);
        return app;
    }

    private String generateMembershipId(User user) {
        return "MBR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
