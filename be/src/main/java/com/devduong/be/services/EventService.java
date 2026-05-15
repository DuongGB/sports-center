package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.request.EventRequest;
import com.devduong.be.dtos.request.EventTargetRequest;
import com.devduong.be.dtos.response.EventResponse;
import com.devduong.be.entities.*;
import com.devduong.be.enums.EventScope;
import com.devduong.be.enums.EventStatus;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.EventMapper;
import com.devduong.be.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class EventService {
    EventRepository eventRepository;
    EventTargetRepository eventTargetRepository;
    UserRepository userRepository;
    SportTypeRepository sportTypeRepository;
    CourtRepository courtRepository;
    EventMapper eventMapper;

    @Transactional
    public EventResponse createEvent(EventRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        validateEventRequest(request, null);

        Event event = Event.builder()
                .name(request.name())
                .description(request.description())
                .type(request.type())
                .scope(request.scope())
                .status(request.status() != null ? request.status() : EventStatus.DRAFT)
                .startDatetime(request.startDatetime())
                .endDatetime(request.endDatetime())
                .discountPercent(request.discountPercent())
                .discountAmount(request.discountAmount())
                .blockReason(request.blockReason())
                .createdByUser(user)
                .build();

        // Tạo targets nếu scope không phải ALL_COURTS
        if (request.targets() != null && !request.targets().isEmpty()) {
            List<EventTarget> targets = buildTargets(request.targets(), event);
            event.getTargets().addAll(targets);
        }

        Event savedEvent = eventRepository.save(event);
        return eventMapper.toEventResponse(savedEvent);
    }

    @Transactional
    public EventResponse updateEvent(UUID eventId, EventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        validateEventRequest(request, event.getStatus());

        event.setName(request.name());
        event.setDescription(request.description());
        event.setType(request.type());
        event.setScope(request.scope());
        if (request.status() != null) {
            event.setStatus(request.status());
        }
        event.setStartDatetime(request.startDatetime());
        event.setEndDatetime(request.endDatetime());
        event.setDiscountPercent(request.discountPercent());
        event.setDiscountAmount(request.discountAmount());
        event.setBlockReason(request.blockReason());

        // Cập nhật targets: dùng clear() và addAll() để tránh lỗi orphanRemoval
        event.getTargets().clear();
        if (request.targets() != null && !request.targets().isEmpty()) {
            List<EventTarget> targets = buildTargets(request.targets(), event);
            event.getTargets().addAll(targets);
        }

        Event savedEvent = eventRepository.save(event);
        return eventMapper.toEventResponse(savedEvent);
    }

    @Transactional
    public void cancelEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        eventRepository.delete(event);
    }

    public EventResponse getEventById(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        return eventMapper.toEventResponse(event);
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(eventMapper::toEventResponse)
                .toList();
    }

    public List<EventResponse> getActiveEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findActiveEventsAtTime(EventStatus.ACTIVE, now).stream()
                .map(eventMapper::toEventResponse)
                .toList();
    }

    public List<EventResponse> getEventsByStatus(EventStatus status) {
        return eventRepository.findByStatusOrderByStartDatetimeDesc(status).stream()
                .map(eventMapper::toEventResponse)
                .toList();
    }

    /**
     * Scheduled job: tự động bật/tắt event theo thời gian.
     * Chạy mỗi 10 phút.
     */
    @Scheduled(fixedRate = 600000)
    @Transactional
    public void autoUpdateEventStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // Tự động ACTIVE các DRAFT event đã đến giờ
        List<Event> draftToActivate = eventRepository.findDraftEventsToActivate(now);
        for (Event event : draftToActivate) {
            event.setStatus(EventStatus.ACTIVE);
        }
        if (!draftToActivate.isEmpty()) {
            eventRepository.saveAll(draftToActivate);
        }

        // Tự động EXPIRED các ACTIVE event đã hết hạn
        List<Event> activeToExpire = eventRepository.findExpiredActiveEvents(now);
        for (Event event : activeToExpire) {
            event.setStatus(EventStatus.EXPIRED);
        }
        if (!activeToExpire.isEmpty()) {
            eventRepository.saveAll(activeToExpire);
        }
    }

    // ==================== PRIVATE METHODS ====================

    private void validateEventRequest(EventRequest request, EventStatus oldStatus) {
        if (request.startDatetime() == null || request.endDatetime() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (request.endDatetime().isBefore(request.startDatetime())) {
            throw new AppException(ErrorCode.INVALID_TIME_RANGE);
        }

        // Nếu status là ACTIVE, kiểm tra xem đã quá hạn chưa
        if (request.status() == EventStatus.ACTIVE) {
            if (LocalDateTime.now().isAfter(request.endDatetime())) {
                throw new AppException(ErrorCode.EVENT_EXPIRED);
            }

            // Nếu không phải đang là ACTIVE mà chuyển sang ACTIVE, hoặc tạo mới ACTIVE
            // thì thời gian bắt đầu không được ở quá khứ
            if (oldStatus != EventStatus.ACTIVE && request.startDatetime().isBefore(LocalDateTime.now().minusMinutes(5))) {
                throw new AppException(ErrorCode.EVENT_START_TIME_INVALID);
            }
        }

        // Validate scope vs targets
        if (request.scope() != EventScope.ALL_COURTS
                && (request.targets() == null || request.targets().isEmpty())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private List<EventTarget> buildTargets(List<EventTargetRequest> targetRequests, Event event) {
        List<EventTarget> targets = new ArrayList<>();
        for (EventTargetRequest req : targetRequests) {
            EventTarget.EventTargetBuilder builder = EventTarget.builder().event(event);

            if (req.sportTypeId() != null) {
                SportType sportType = sportTypeRepository.findById(req.sportTypeId())
                        .orElseThrow(() -> new AppException(ErrorCode.SPORT_TYPE_NOT_FOUND));
                builder.sportType(sportType);
            }
            if (req.courtId() != null) {
                Court court = courtRepository.findById(req.courtId())
                        .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
                builder.court(court);
            }

            targets.add(builder.build());
        }
        return targets;
    }
}
