/*
 * @ {#} CourtService.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.CourtAvailabilityRequest;
import com.devduong.be.dtos.request.CourtFilterRequest;
import com.devduong.be.dtos.request.CourtRequest;
import com.devduong.be.dtos.response.CourtResponse;
import com.devduong.be.entities.*;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
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
        Pageable pageable = request.getPageable();
        Page<Court> courtPage = courtRepository.findAllWithFilter(request.keyword(), request.status(), request.sportTypeId(), pageable);
        List<CourtResponse> courtResponses = courtPage.getContent().stream()
                .map(courtMapper::toCourtResponse)
                .toList();
        return new PageResponse<>(
                request.page(),
                courtPage.getTotalPages(),
                (long) courtPage.getSize(),
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
    public CourtResponse createCourt(
            CourtRequest request,
            List<MultipartFile> images
    ) {

        SportType sportType = sportTypeRepository.findById(request.sportTypeId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.SPORT_TYPE_NOT_FOUND)
                );

        Court court = Court.builder()
                .sportType(sportType)
                .name(request.name())
                .location(request.location())
                .openTime(request.openTime())
                .closeTime(request.closeTime())
                .status(request.status())
                .build();

        // 1. Xử lý lưu nhiều ảnh
        if (images != null && !images.isEmpty()) {
            List<CourtImage> courtImages = images.stream()
                    .filter(img -> img != null && !img.isEmpty())
                    .map(img -> {
                        String uploadedUrl = cloudinaryService.uploadImage(img);
                        CourtImage courtImage = new CourtImage();
                        courtImage.setCourt(court);
                        courtImage.setImageUrl(uploadedUrl);
                        return courtImage;
                    }).toList();
            court.setCourtImages(courtImages);
        }

        // 2. Availability
        if (request.availabilities() != null) {
            List<CourtAvailability> availabilities =
                    request.availabilities().stream()
                            .map(availReq -> CourtAvailability.builder()
                                    .court(court)
                                    .date(availReq.date())
                                    .startTime(availReq.startTime())
                                    .endTime(availReq.endTime())
                                    .reason(availReq.reason())
                                    .status(availReq.status())
                                    .build())
                            .toList();

            court.setCourtAvailabilities(availabilities);
        }

        // Giá sân (prices) đã được chuyển sang SportType, không còn lưu ở Court nữa

        Court savedCourt = courtRepository.save(court);

        return courtMapper.toCourtResponse(savedCourt);
    }

    // TODO: Update court
    @Transactional
    public CourtResponse updateCourt(
            UUID id,
            CourtRequest request,
            List<MultipartFile> images
    ) {

        Court court = courtRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.COURT_NOT_FOUND)
                );

        SportType sportType = sportTypeRepository.findById(
                        request.sportTypeId()
                )
                .orElseThrow(() ->
                        new AppException(ErrorCode.SPORT_TYPE_NOT_FOUND)
                );

        // Update thông tin cơ bản của sân
        court.setName(request.name());
        court.setLocation(request.location());
        court.setSportType(sportType);
        court.setOpenTime(request.openTime());
        court.setCloseTime(request.closeTime());

        if (request.status() != null) {
            court.setStatus(request.status());
        }

        // 1. Xử lý cập nhật danh sách ảnh
        if (images != null && !images.isEmpty()) {
            List<CourtImage> newCourtImages = images.stream()
                    .filter(img -> img != null && !img.isEmpty())
                    .map(img -> {
                        String uploadedUrl = cloudinaryService.uploadImage(img);
                        CourtImage courtImage = new CourtImage();
                        courtImage.setCourt(court);
                        courtImage.setImageUrl(uploadedUrl);
                        return courtImage;
                    }).toList();

            if (court.getCourtImages() != null) {
                court.getCourtImages().clear();
                court.getCourtImages().addAll(newCourtImages);
            } else {
                court.setCourtImages(newCourtImages);
            }
        }

        // 2. UPDATE AVAILABILITY
        if (request.availabilities() != null) {
            if (court.getCourtAvailabilities() != null) {
                court.getCourtAvailabilities().clear();
            } else {
                court.setCourtAvailabilities(new ArrayList<>());
            }

            for (CourtAvailabilityRequest availReq : request.availabilities()) {
                CourtAvailability availability = CourtAvailability.builder()
                        .court(court)
                        .date(availReq.date())
                        .startTime(availReq.startTime())
                        .endTime(availReq.endTime())
                        .reason(availReq.reason())
                        .status(availReq.status())
                        .build();

                court.getCourtAvailabilities().add(availability);
            }
        }

        // Đã gỡ bỏ logic UPDATE PRICE do không còn liên quan tới Court

        courtRepository.save(court);
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

