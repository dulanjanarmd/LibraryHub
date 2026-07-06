package com.sliit.library.security;

import com.sliit.library.entity.User;
import com.sliit.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByStudentStaffId(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));

        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("Account is deactivated: " + identifier);
        }

        return UserDetailsImpl.build(user);
    }
}
