package com.helpdesk.controller;

import com.helpdesk.model.Comment;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.User;
import com.helpdesk.service.AuthService;
import com.helpdesk.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private AuthService authService;

    private User getCurrentUser(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        return authService.getUserByUsername(userDetails.getUsername());
    }

    private boolean isAgentOrAdmin(Authentication auth) {
        return auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_AGENT")) ||
               auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    // Create ticket
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, String> body, Authentication auth) {
        try {
            User user = getCurrentUser(auth);
            Ticket ticket = ticketService.createTicket(
                    body.get("title"),
                    body.get("description"),
                    Ticket.Priority.valueOf(body.get("priority")),
                    Ticket.Category.valueOf(body.get("category")),
                    user
            );
            return ResponseEntity.ok(toTicketMap(ticket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get tickets (my tickets for users, all for agents/admins)
    @GetMapping
    public ResponseEntity<?> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {

        User user = getCurrentUser(auth);

        if (isAgentOrAdmin(auth)) {
            Ticket.Status statusEnum = status != null ? Ticket.Status.valueOf(status) : null;
            Ticket.Priority priorityEnum = priority != null ? Ticket.Priority.valueOf(priority) : null;
            Ticket.Category categoryEnum = category != null ? Ticket.Category.valueOf(category) : null;

            Page<Ticket> tickets = ticketService.getAllTickets(
                    statusEnum, priorityEnum, categoryEnum, keyword, page, size, "createdAt");
            return ResponseEntity.ok(toPageMap(tickets));
        } else {
            Page<Ticket> tickets = ticketService.getTicketsByUser(user, page, size);
            return ResponseEntity.ok(toPageMap(tickets));
        }
    }

    // Get my assigned tickets (for agents)
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getAssignedTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        User agent = getCurrentUser(auth);
        Page<Ticket> tickets = ticketService.getTicketsAssignedTo(agent, page, size);
        return ResponseEntity.ok(toPageMap(tickets));
    }

    // Get single ticket
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(@PathVariable Long id, Authentication auth) {
        return ticketService.getTicketById(id)
                .map(ticket -> {
                    // Users can only see their own tickets
                    if (!isAgentOrAdmin(auth)) {
                        User user = getCurrentUser(auth);
                        if (!ticket.getCreatedBy().getId().equals(user.getId())) {
                            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                        }
                    }
                    return ResponseEntity.ok((Object) toTicketMapWithComments(ticket));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update ticket
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable Long id,
                                          @RequestBody Map<String, Object> updates,
                                          Authentication auth) {
        try {
            User user = getCurrentUser(auth);

            // Users can only update their own tickets (limited fields)
            if (!isAgentOrAdmin(auth)) {
                Ticket ticket = ticketService.getTicketById(id)
                        .orElseThrow(() -> new RuntimeException("Ticket not found"));
                if (!ticket.getCreatedBy().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                }
                // Users can only update description
                Map<String, Object> limitedUpdates = new HashMap<>();
                if (updates.containsKey("description")) limitedUpdates.put("description", updates.get("description"));
                updates = limitedUpdates;
            }

            Ticket updated = ticketService.updateTicket(id, updates, user);
            return ResponseEntity.ok(toTicketMap(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Add comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id,
                                        @RequestBody Map<String, Object> body,
                                        Authentication auth) {
        try {
            User user = getCurrentUser(auth);
            boolean internal = body.get("internal") != null && (boolean) body.get("internal");

            // Non-agents cannot add internal notes
            if (internal && !isAgentOrAdmin(auth)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            Comment comment = ticketService.addComment(id, (String) body.get("content"), internal, user);
            return ResponseEntity.ok(toCommentMap(comment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long id, Authentication auth) {
        List<Comment> comments = ticketService.getComments(id);
        boolean isAgent = isAgentOrAdmin(auth);
        List<Map<String, Object>> result = comments.stream()
                .filter(c -> isAgent || !c.isInternal())
                .map(this::toCommentMap)
                .toList();
        return ResponseEntity.ok(result);
    }

    // Dashboard stats
    @GetMapping("/stats/dashboard")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(ticketService.getDashboardStats());
    }

    // Get agents for assignment
    @GetMapping("/agents/list")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getAgents() {
        List<User> agents = authService.getAllAgents();
        return ResponseEntity.ok(agents.stream().map(u -> Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "fullName", u.getFullName(),
                "role", u.getRole().name()
        )).toList());
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private Map<String, Object> toTicketMap(Ticket t) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", t.getId());
        m.put("ticketNumber", t.getTicketNumber());
        m.put("title", t.getTitle());
        m.put("description", t.getDescription());
        m.put("priority", t.getPriority().name());
        m.put("status", t.getStatus().name());
        m.put("category", t.getCategory().name());
        m.put("createdAt", t.getCreatedAt());
        m.put("updatedAt", t.getUpdatedAt());
        m.put("resolvedAt", t.getResolvedAt());
        m.put("resolutionNotes", t.getResolutionNotes());
        m.put("createdBy", toUserMap(t.getCreatedBy()));
        m.put("assignedTo", t.getAssignedTo() != null ? toUserMap(t.getAssignedTo()) : null);
        return m;
    }

    private Map<String, Object> toTicketMapWithComments(Ticket t) {
        Map<String, Object> m = toTicketMap(t);
        if (t.getComments() != null) {
            m.put("commentCount", t.getComments().size());
        }
        return m;
    }

    private Map<String, Object> toUserMap(User u) {
        return Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "fullName", u.getFullName(),
                "email", u.getEmail(),
                "department", u.getDepartment() != null ? u.getDepartment() : "",
                "role", u.getRole().name()
        );
    }

    private Map<String, Object> toCommentMap(Comment c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("content", c.getContent());
        m.put("internal", c.isInternal());
        m.put("createdAt", c.getCreatedAt());
        m.put("author", toUserMap(c.getAuthor()));
        return m;
    }

    private Map<String, Object> toPageMap(Page<Ticket> page) {
        Map<String, Object> m = new HashMap<>();
        m.put("content", page.getContent().stream().map(this::toTicketMap).toList());
        m.put("totalElements", page.getTotalElements());
        m.put("totalPages", page.getTotalPages());
        m.put("currentPage", page.getNumber());
        m.put("pageSize", page.getSize());
        return m;
    }
}
