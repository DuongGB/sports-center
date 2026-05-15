package com.devduong.be.repositories;

import com.devduong.be.entities.EventTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventTargetRepository extends JpaRepository<EventTarget, UUID> {

    List<EventTarget> findByEventId(UUID eventId);

    void deleteByEventId(UUID eventId);
}
