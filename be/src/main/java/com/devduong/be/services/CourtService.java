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
import com.devduong.be.dtos.request.CourtPriceRequest;
import com.devduong.be.dtos.request.CourtRequest;
import com.devduong.be.dtos.response.CourtResponse;
import com.devduong.be.entities.*;
import com.devduong.be.enums.CourtStatus;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.CourtMapper;
import com.devduong.be.repositories.CourtPriceRepository;
import com.devduong.be.repositories.CourtRepository;
import com.devduong.be.repositories.SportTypeRepository;
import com.devduong.be.repositories.TimeSlotRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    TimeSlotRepository timeSlotRepository;
    CourtPriceRepository courtPriceRepository;
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
    public CourtResponse createCourt(
            CourtRequest request,
            MultipartFile image
    ) {

        SportType sportType = sportTypeRepository.findById(request.sportTypeId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.SPORT_TYPE_NOT_FOUND)
                );

        Court court = Court.builder()
                .sportType(sportType)
                .name(request.name())
                .location(request.location())
                .status(request.status())
                .build();

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            court.setImageUrl(imageUrl);
        }

        // Availability

        if (request.availabilities() != null) {

            List<CourtAvailability> availabilities =
                    request.availabilities().stream()
                            .map(availReq -> {

                                TimeSlot timeSlot =
                                        timeSlotRepository.findById(
                                                        availReq.timeSlotId()
                                                )
                                                .orElseThrow(() ->
                                                        new AppException(
                                                                ErrorCode.TIME_SLOT_NOT_FOUND
                                                        )
                                                );

                                return CourtAvailability.builder()
                                        .court(court)
                                        .timeSlot(timeSlot)
                                        .date(availReq.date())
                                        .status(availReq.status())
                                        .build();

                            })
                            .toList();

            court.setCourtAvailabilities(availabilities);
        }

        // Price

        if (request.prices() != null) {

            List<CourtPrice> prices =
                    request.prices().stream()
                            .map(priceReq -> {

                                TimeSlot timeSlot =
                                        timeSlotRepository.findById(
                                                        priceReq.timeSlotId()
                                                )
                                                .orElseThrow(() ->
                                                        new AppException(
                                                                ErrorCode.TIME_SLOT_NOT_FOUND
                                                        )
                                                );

                                return CourtPrice.builder()
                                        .court(court)
                                        .timeSlot(timeSlot)
                                        .price(priceReq.price())
                                        .build();

                            })
                            .toList();

            court.setCourtPrices(prices);
        }

        Court savedCourt = courtRepository.save(court);

        return courtMapper.toCourtResponse(savedCourt);
    }

    // TODO: Update court
    @Transactional
    public CourtResponse updateCourt(
            UUID id,
            CourtRequest request,
            MultipartFile image
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

        court.setName(request.name());
        court.setLocation(request.location());
        court.setSportType(sportType);

        if (request.status() != null) {
            court.setStatus(request.status());
        }

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            court.setImageUrl(imageUrl);
        }

        // UPDATE AVAILABILITY

        if (request.availabilities() != null) {

            court.getCourtAvailabilities().clear();

            for (CourtAvailabilityRequest availReq :
                    request.availabilities()) {

                TimeSlot timeSlot =
                        timeSlotRepository.findById(
                                        availReq.timeSlotId()
                                )
                                .orElseThrow(() ->
                                        new AppException(
                                                ErrorCode.TIME_SLOT_NOT_FOUND
                                        )
                                );

                CourtAvailability availability =
                        CourtAvailability.builder()
                                .court(court)
                                .timeSlot(timeSlot)
                                .date(availReq.date())
                                .status(availReq.status())
                                .build();

                court.getCourtAvailabilities().add(
                        availability
                );
            }
        }

        // UPDATE PRICE

        if (request.prices() != null) {

            court.getCourtPrices().clear();

            for (CourtPriceRequest priceReq :
                    request.prices()) {

                TimeSlot timeSlot =
                        timeSlotRepository.findById(
                                        priceReq.timeSlotId()
                                )
                                .orElseThrow(() ->
                                        new AppException(
                                                ErrorCode.TIME_SLOT_NOT_FOUND
                                        )
                                );

                CourtPrice price =
                        CourtPrice.builder()
                                .court(court)
                                .timeSlot(timeSlot)
                                .price(priceReq.price())
                                .build();

                court.getCourtPrices().add(price);
            }
        }

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

