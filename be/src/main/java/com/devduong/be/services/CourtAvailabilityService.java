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
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.CourtAvailabilityMapper;
import com.devduong.be.repositories.CourtAvailabilityRepository;
import com.devduong.be.repositories.CourtRepository;
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
    CourtAvailabilityMapper courtAvailabilityMapper;

    // TODO: get list availability by court id and date
    public List<CourtAvailabilityResponse> getAvailabilitiesByCourtIdAndDate(UUID courtId, LocalDate date) {
        return courtAvailabilityRepository.findByCourtIdAndDate(courtId, date).stream()
                .map(courtAvailabilityMapper::toCourtAvailabilityResponse)
                .toList();
    }

    // TODO: create/update court availability
    @Transactional
    public CourtAvailabilityResponse createOrUpdateAvailability(UUID courtId,CourtAvailabilityRequest request) {

        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
        CourtAvailability courtAvailability = CourtAvailability.builder()
                .court(court)
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .reason(request.reason())
                .status(request.status())
                .build();
        return courtAvailabilityMapper.toCourtAvailabilityResponse(courtAvailabilityRepository.save(courtAvailability));
    }
}

