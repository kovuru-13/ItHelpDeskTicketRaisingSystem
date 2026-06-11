package com.helpdesk.repository;

import com.helpdesk.model.Ticket;
import com.helpdesk.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    Page<Ticket> findByCreatedBy(User user, Pageable pageable);

    Page<Ticket> findByAssignedTo(User user, Pageable pageable);

    Page<Ticket> findByStatus(Ticket.Status status, Pageable pageable);

    Page<Ticket> findByPriority(Ticket.Priority priority, Pageable pageable);

    List<Ticket> findByStatus(Ticket.Status status);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           " OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Ticket> findWithFilters(
            @Param("status") Ticket.Status status,
            @Param("priority") Ticket.Priority priority,
            @Param("category") Ticket.Category category,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status")
    long countByStatus(@Param("status") Ticket.Status status);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.priority = :priority AND t.status NOT IN ('RESOLVED','CLOSED')")
    long countOpenByPriority(@Param("priority") Ticket.Priority priority);
}
