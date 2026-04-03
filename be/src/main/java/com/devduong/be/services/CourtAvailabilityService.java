/*
 * @ {#} CourtAvailabilityService.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.request.CourtAvailabilityRequest;
import com.devduong.be.dtos.response.CourtAvailabilityResponse;
import com.devduong.be.entities.Court;
import com.devduong.be.entities.CourtAvailability;
import com.devduong.be.entities.TimeSlot;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.CourtAvailabilityMapper;
import com.devduong.be.repositories.CourtAvailabilityRepository;
import com.devduong.be.repositories.CourtRepository;
import com.devduong.be.repositories.TimeSlotRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourtAvailabilityService {
    CourtAvailabilityRepository courtAvailabilityRepository;
    CourtRepository courtRepository;
    TimeSlotRepository timeSlotRepository;
    CourtAvailabilityMapper courtAvailabilityMapper;

    // TODO: get list availability by court id and date
    public List<CourtAvailabilityResponse> getAvailabilitiesByCourtIdAndDate(UUID courtId, LocalDate date) {
        return courtAvailabilityRepository.findByCourtIdAndDate(courtId, date).stream()
                .map(courtAvailabilityMapper::toCourtAvailabilityResponse)
                .toList();
    }

    // TODO: create/update court availability
    @Transactional
    public CourtAvailabilityResponse createOrUpdateAvailability(CourtAvailabilityRequest request) {
        // Check có record nào trùng sân, trùng ngày, trùng giờ không
        if (courtAvailabilityRepository.existsByCourtIdAndDateAndTimeSlotId(request.courtId(), request.date(), request.timeSlotId())) {
            throw new AppException(ErrorCode.AVAILABILITY_ALREADY_EXISTS);
        }
        Court court = courtRepository.findById(request.courtId())
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
        TimeSlot timeSlot = timeSlotRepository.findById(request.timeSlotId())
                .orElseThrow(() -> new AppException(ErrorCode.TIME_SLOT_NOT_FOUND));
        CourtAvailability courtAvailability = CourtAvailability.builder()
                .court(court)
                .date(request.date())
                .timeSlot(timeSlot)
                .status(request.status())
                .build();
        return courtAvailabilityMapper.toCourtAvailabilityResponse(courtAvailabilityRepository.save(courtAvailability));
    }
}

