package com.helpdesk.service;

import com.helpdesk.model.User;
import com.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> register(String username, String email, String password,
                                         String fullName, String department, String phone) {
        Map<String, Object> result = new HashMap<>();

        if (userRepository.existsByUsername(username)) {
            result.put("error", "Username already taken");
            return result;
        }
        if (userRepository.existsByEmail(email)) {
            result.put("error", "Email already in use");
            return result;
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .department(department)
                .phone(phone)
                .role(User.Role.USER)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        result.put("user", saved);
        return result;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public java.util.List<User> getAllAgents() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.AGENT || u.getRole() == User.Role.ADMIN)
                .toList();
    }
}
