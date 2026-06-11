package com.helpdesk.service;

import com.helpdesk.model.Comment;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.User;
import com.helpdesk.repository.CommentRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a ticket
    @Transactional
    public Ticket createTicket(String title, String description, Ticket.Priority priority,
                                Ticket.Category category, User createdBy) {
        Ticket ticket = Ticket.builder()
                .title(title)
                .description(description)
                .priority(priority)
                .category(category)
                .status(Ticket.Status.OPEN)
                .createdBy(createdBy)
                .build();
        return ticketRepository.save(ticket);
    }

    // Get all tickets (admin/agent) with filters
    public Page<Ticket> getAllTickets(Ticket.Status status, Ticket.Priority priority,
                                      Ticket.Category category, String keyword,
                                      int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return ticketRepository.findWithFilters(status, priority, category, keyword, pageable);
    }

    // Get tickets by user
    public Page<Ticket> getTicketsByUser(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ticketRepository.findByCreatedBy(user, pageable);
    }

    // Get tickets assigned to agent
    public Page<Ticket> getTicketsAssignedTo(User agent, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ticketRepository.findByAssignedTo(agent, pageable);
    }

    // Get single ticket
    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Optional<Ticket> getTicketByNumber(String ticketNumber) {
        return ticketRepository.findByTicketNumber(ticketNumber);
    }

    // Update ticket
    @Transactional
    public Ticket updateTicket(Long ticketId, Map<String, Object> updates, User updatedBy) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (updates.containsKey("title")) ticket.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) ticket.setDescription((String) updates.get("description"));
        if (updates.containsKey("priority"))
            ticket.setPriority(Ticket.Priority.valueOf((String) updates.get("priority")));
        if (updates.containsKey("category"))
            ticket.setCategory(Ticket.Category.valueOf((String) updates.get("category")));
        if (updates.containsKey("resolutionNotes"))
            ticket.setResolutionNotes((String) updates.get("resolutionNotes"));

        if (updates.containsKey("status")) {
            Ticket.Status newStatus = Ticket.Status.valueOf((String) updates.get("status"));
            ticket.setStatus(newStatus);
            if (newStatus == Ticket.Status.RESOLVED) ticket.setResolvedAt(LocalDateTime.now());
            if (newStatus == Ticket.Status.CLOSED) ticket.setClosedAt(LocalDateTime.now());
        }

        if (updates.containsKey("assignedToId") && updates.get("assignedToId") != null) {
            Long agentId = Long.parseLong(updates.get("assignedToId").toString());
            User agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent not found"));
            ticket.setAssignedTo(agent);
            if (ticket.getStatus() == Ticket.Status.OPEN) {
                ticket.setStatus(Ticket.Status.IN_PROGRESS);
            }
        }

        return ticketRepository.save(ticket);
    }

    // Add comment
    @Transactional
    public Comment addComment(Long ticketId, String content, boolean internal, User author) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Comment comment = Comment.builder()
                .content(content)
                .ticket(ticket)
                .author(author)
                .internal(internal)
                .build();
        return commentRepository.save(comment);
    }

    // Get comments
    public List<Comment> getComments(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
    }

    // Dashboard stats
    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", ticketRepository.count());
        stats.put("open", ticketRepository.countByStatus(Ticket.Status.OPEN));
        stats.put("inProgress", ticketRepository.countByStatus(Ticket.Status.IN_PROGRESS));
        stats.put("pending", ticketRepository.countByStatus(Ticket.Status.PENDING));
        stats.put("resolved", ticketRepository.countByStatus(Ticket.Status.RESOLVED));
        stats.put("closed", ticketRepository.countByStatus(Ticket.Status.CLOSED));
        stats.put("critical", ticketRepository.countOpenByPriority(Ticket.Priority.CRITICAL));
        stats.put("high", ticketRepository.countOpenByPriority(Ticket.Priority.HIGH));
        return stats;
    }
}
