/*
 * @ {#} CourtService.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.CourtFilterRequest;
import com.devduong.be.dtos.request.CourtRequest;
import com.devduong.be.dtos.response.CourtResponse;
import com.devduong.be.entities.Court;
import com.devduong.be.entities.SportType;
import com.devduong.be.enums.CourtStatus;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.CourtMapper;
import com.devduong.be.repositories.CourtRepository;
import com.devduong.be.repositories.SportTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/18/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourtService {
    CourtRepository courtRepository;
    SportTypeRepository sportTypeRepository;
    CourtMapper courtMapper;
    CloudinaryService cloudinaryService;

    // TODO: Get all courts with filter and pagination
    public PageResponse<CourtResponse> getAllCourts(CourtFilterRequest request) {
        // Cấu hình sorting
        Pageable pageable = request.getPageable();
        // Gọi DB
        Page<Court> courtPage = courtRepository.findAllWithFilter(request.keyword(), request.status(), pageable);
        // Map Entity sang DTO
        List<CourtResponse> courtResponses = courtPage.getContent().stream()
                .map(courtMapper::toCourtResponse)
                .toList();
        // Trả về kết quả
        return new PageResponse<>(
                request.page(),
                request.size(),
                courtPage.getTotalPages(),
                courtPage.getTotalElements(),
                courtResponses
        );
    }

    // TODO: Get court by id
    public CourtResponse getCourtById(UUID id) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
        return courtMapper.toCourtResponse(court);
    }

    // TODO: Create court
    @Transactional
    public CourtResponse createCourt(CourtRequest request) {
        String imageUrl = null;
        if (request.image() != null && !request.image().isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(request.image());
        }
        SportType sportType = sportTypeRepository.findById(request.sportTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.SPORT_TYPE_NOT_FOUND));
        CourtStatus status = CourtStatus.ACTIVE;
        Court court = Court.builder()
                .id(UUID.randomUUID())
                .name(request.name())
                .location(request.location())
                .imageUrl(imageUrl)
                .status(status)
                .sportType(sportType)
                .build();
        // Lưu vào DB
        court = courtRepository.save(court);
        // Map Entity sang DTO và trả về
        return courtMapper.toCourtResponse(court);
    }

    // TODO: Update court
    @Transactional
    public CourtResponse updateCourt(UUID id, CourtRequest request) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
        SportType sportType = sportTypeRepository.findById(request.sportTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.SPORT_TYPE_NOT_FOUND));
        if (request.image() != null && !request.image().isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(request.image());
            court.setImageUrl(imageUrl);
        }
        court.setName(request.name());
        court.setSportType(sportType);
        court.setLocation(request.location());
        court.setSportType(sportType);
        // Lưu vào DB
        court = courtRepository.save(court);
        // Map Entity sang DTO và trả về
        return courtMapper.toCourtResponse(court);
    }

    // TODO: Delete court
    public void maintenanceCourt(UUID id) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
        court.setStatus(CourtStatus.MAINTENANCE);
        courtRepository.save(court);
    }
}

