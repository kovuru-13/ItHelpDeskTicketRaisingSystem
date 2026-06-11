package com.helpdesk.dto;

import com.helpdesk.model.Comment;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

// ========================
// AUTH DTOs
// ========================

class LoginRequest {
    @NotBlank public String username;
    @NotBlank public String password;
}

class RegisterRequest {
    @NotBlank public String username;
    @NotBlank @Email public String email;
    @NotBlank public String password;
    @NotBlank public String fullName;
    public String department;
    public String phone;
}

class AuthResponse {
    public String token;
    public String type = "Bearer";
    public Long id;
    public String username;
    public String email;
    public String fullName;
    public String role;
}

// ========================
// TICKET DTOs
// ========================

class CreateTicketRequest {
    @NotBlank public String title;
    @NotBlank public String description;
    @NotNull public Ticket.Priority priority;
    @NotNull public Ticket.Category category;
}

class UpdateTicketRequest {
    public String title;
    public String description;
    public Ticket.Priority priority;
    public Ticket.Status status;
    public Ticket.Category category;
    public Long assignedToId;
    public String resolutionNotes;
}

class TicketResponse {
    public Long id;
    public String ticketNumber;
    public String title;
    public String description;
    public String priority;
    public String status;
    public String category;
    public UserSummary createdBy;
    public UserSummary assignedTo;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public LocalDateTime resolvedAt;
    public String resolutionNotes;
    public List<CommentResponse> comments;
    public int commentCount;
}

// ========================
// COMMENT DTOs
// ========================

class AddCommentRequest {
    @NotBlank public String content;
    public boolean internal = false;
}

class CommentResponse {
    public Long id;
    public String content;
    public boolean internal;
    public UserSummary author;
    public LocalDateTime createdAt;
}

// ========================
// USER DTOs
// ========================

class UserSummary {
    public Long id;
    public String username;
    public String fullName;
    public String email;
    public String department;
    public String role;
}

class DashboardStats {
    public long totalTickets;
    public long openTickets;
    public long inProgressTickets;
    public long resolvedTickets;
    public long closedTickets;
    public long criticalTickets;
    public long highPriorityTickets;
}
