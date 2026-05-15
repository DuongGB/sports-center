package com.devduong.be.repositories;

import com.devduong.be.entities.Event;
import com.devduong.be.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findAllByOrderByCreatedAtDesc();

    List<Event> findByStatusOrderByStartDatetimeDesc(EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.status = :status " +
            "AND e.startDatetime <= :now AND e.endDatetime >= :now " +
            "ORDER BY e.startDatetime DESC")
    List<Event> findActiveEventsAtTime(@Param("status") EventStatus status,
                                       @Param("now") LocalDateTime now);

    @Query("SELECT e FROM Event e WHERE e.status = 'ACTIVE' " +
            "AND e.endDatetime < :now")
    List<Event> findExpiredActiveEvents(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM Event e WHERE e.status = 'DRAFT' " +
            "AND e.startDatetime <= :now AND e.endDatetime >= :now")
    List<Event> findDraftEventsToActivate(@Param("now") LocalDateTime now);
}
