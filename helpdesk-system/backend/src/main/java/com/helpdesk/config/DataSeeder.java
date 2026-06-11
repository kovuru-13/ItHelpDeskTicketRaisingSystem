package com.helpdesk.config;

import com.helpdesk.model.Ticket;
import com.helpdesk.model.User;
import com.helpdesk.repository.UserRepository;
import com.helpdesk.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private TicketService ticketService;

    @Override
    public void run(String... args) {
        // Create admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin").email("admin@helpdesk.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .department("IT").role(User.Role.ADMIN).active(true).build();
            userRepository.save(admin);
        }

        // Create agent
        if (!userRepository.existsByUsername("agent1")) {
            User agent = User.builder()
                    .username("agent1").email("agent1@helpdesk.com")
                    .password(passwordEncoder.encode("agent123"))
                    .fullName("Alice Johnson").department("IT Support")
                    .role(User.Role.AGENT).active(true).build();
            userRepository.save(agent);
        }

        // Create regular users
        if (!userRepository.existsByUsername("user1")) {
            User user = User.builder()
                    .username("user1").email("user1@helpdesk.com")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("Bob Smith").department("Finance")
                    .role(User.Role.USER).active(true).build();
            userRepository.save(user);

            // Seed demo tickets
            User u = userRepository.findByUsername("user1").get();
            ticketService.createTicket("Cannot access company VPN",
                    "I am unable to connect to the company VPN from home. Getting error 'Authentication failed'.",
                    Ticket.Priority.HIGH, Ticket.Category.NETWORK, u);
            ticketService.createTicket("Laptop screen flickering",
                    "My laptop screen has been flickering intermittently for the past 2 days. It's hard to work.",
                    Ticket.Priority.MEDIUM, Ticket.Category.HARDWARE, u);
            ticketService.createTicket("Need MS Office installation",
                    "I need Microsoft Office installed on my new laptop. Please assist.",
                    Ticket.Priority.LOW, Ticket.Category.SOFTWARE, u);
        }

        if (!userRepository.existsByUsername("user2")) {
            User user2 = User.builder()
                    .username("user2").email("user2@helpdesk.com")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("Carol Davis").department("HR")
                    .role(User.Role.USER).active(true).build();
            userRepository.save(user2);

            User u2 = userRepository.findByUsername("user2").get();
            ticketService.createTicket("Email not syncing on mobile",
                    "My company email is not syncing on my iPhone. Last sync was 3 days ago.",
                    Ticket.Priority.MEDIUM, Ticket.Category.EMAIL, u2);
            ticketService.createTicket("Printer not responding",
                    "The printer on floor 2 is not responding to print jobs. Multiple users affected.",
                    Ticket.Priority.CRITICAL, Ticket.Category.HARDWARE, u2);
        }

        System.out.println("========================================");
        System.out.println("  IT Help Desk Demo Credentials:");
        System.out.println("  Admin:  admin / admin123");
        System.out.println("  Agent:  agent1 / agent123");
        System.out.println("  User:   user1 / user123");
        System.out.println("  User:   user2 / user123");
        System.out.println("========================================");
    }
}
