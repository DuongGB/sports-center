/*
 * @ {#} CourtPriceService.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.request.CourtPriceRequest;
import com.devduong.be.dtos.response.CourtPriceResponse;
import com.devduong.be.entities.Court;
import com.devduong.be.entities.CourtPrice;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.CourtPriceMapper;
import com.devduong.be.repositories.CourtPriceRepository;
import com.devduong.be.repositories.CourtRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
public class CourtPriceService {
    CourtPriceRepository courtPriceRepository;
    CourtRepository courtRepository;
    CourtPriceMapper courtPriceMapper;

    // TODO: get list price by court id
    public List<CourtPriceResponse> getCourtPricesByCourtId(UUID courtId) {
        return courtPriceRepository.findByCourtId(courtId).stream()
                .map(courtPriceMapper::toCourtPriceResponse)
                .toList();
    }

    // TODO: create court price
    @Transactional
    public CourtPriceResponse createCourtPrice(UUID courtId,CourtPriceRequest request) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
        CourtPrice courtPrice = CourtPrice.builder()
                .court(court)
                .startTime(request.startTime())
                .endTime(request.endTime())
                .price(request.price())
                .build();
        return courtPriceMapper.toCourtPriceResponse(courtPriceRepository.save(courtPrice));
    }



}

