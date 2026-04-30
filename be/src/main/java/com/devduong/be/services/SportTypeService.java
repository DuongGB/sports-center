/*
 * @ {#} SportTypeService.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.SportTypeFilterRequest;
import com.devduong.be.dtos.request.SportTypeRequest;
import com.devduong.be.dtos.response.SportTypeResponse;
import com.devduong.be.entities.CourtPrice;
import com.devduong.be.entities.SportType;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.SportTypeMapper;
import com.devduong.be.repositories.CourtPriceRepository;
import com.devduong.be.repositories.SportTypeRepository;
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
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SportTypeService {
    SportTypeRepository sportTypeRepository;
    CourtPriceRepository courtPriceRepository;
    SportTypeMapper sportTypeMapper;

    // TODO: Get all sport types
    public PageResponse<SportTypeResponse> getAllSportTypes(SportTypeFilterRequest request) {
        // Cấu hình sorting
        Pageable pageable = request.getPageable();
        // Gọi DB
        Page<SportType> sportTypePage = sportTypeRepository.findAllWithFilter(request.keyword(), pageable);
        // Map Entity sang DTO
        List<SportTypeResponse> sportTypeResponses = sportTypePage.getContent().stream()
                .map(sportTypeMapper::toSportTypeResponse)
                .toList();
        // Trả về kết quả
        return new PageResponse<>(
                request.page(),
                sportTypePage.getTotalPages(),
                sportTypePage.getSize(),
                sportTypePage.getTotalElements(),
                sportTypeResponses
        );
    }

    // TODO: Get sport type by id
    public SportTypeResponse getSportTypeById(UUID id) {
        SportType sportType = sportTypeRepository.findById(id)
                .orElseThrow();
        return sportTypeMapper.toSportTypeResponse(sportType);
    }

    // TODO: Create new sport type
    @Transactional
    public SportTypeResponse createSportType(SportTypeRequest request) {
        if (sportTypeRepository.findByName(request.name()).isPresent()) {
            throw new AppException(ErrorCode.SPORT_TYPE_EXISTS);
        }
        // 1. Lưu Sport Type
        SportType sportType = SportType.builder()
                .name(request.name())
                .build();
        SportType savedSportType = sportTypeRepository.save(sportType);
        // 2. Lưu danh sách khung giờ và giá
        if (request.prices() != null && !request.prices().isEmpty()) {
            List<CourtPrice> prices = request.prices().stream()
                    .map(p -> CourtPrice.builder()
                            .sportType(savedSportType)
                            .startTime(p.startTime())
                            .endTime(p.endTime())
                            .price(p.price())
                            .build())
                    .toList();
            List<CourtPrice> savedPrices = courtPriceRepository.saveAll(prices);
            savedSportType.setCourtPrices(savedPrices);
        }
        return sportTypeMapper.toSportTypeResponse(savedSportType);
    }

    // TODO: Update sport type
    @Transactional
    public SportTypeResponse updateSportType(UUID id, SportTypeRequest request) {
        SportType sportType = sportTypeRepository.findById(id).orElseThrow();

        if (!sportType.getName().equals(request.name()) && sportTypeRepository.findByName(request.name()).isPresent()) {
            throw new AppException(ErrorCode.SPORT_TYPE_EXISTS);
        }

        // 1. Cập nhật tên Sport Type
        sportType.setName(request.name());
        SportType savedSportType = sportTypeRepository.save(sportType);

        // 2. Cập nhật bảng giá (Xóa giá cũ, thêm giá mới)
        List<CourtPrice> existingPrices = courtPriceRepository.findBySportTypeId(id);
        if (!existingPrices.isEmpty()) {
            courtPriceRepository.deleteAll(existingPrices);
        }

        if (request.prices() != null && !request.prices().isEmpty()) {
            List<CourtPrice> prices = request.prices().stream()
                    .map(p -> CourtPrice.builder()
                            .sportType(savedSportType)
                            .startTime(p.startTime())
                            .endTime(p.endTime())
                            .price(p.price())
                            .build())
                    .toList();
            List<CourtPrice> savedPrices = courtPriceRepository.saveAll(prices);
            savedSportType.setCourtPrices(savedPrices);
        }

        return sportTypeMapper.toSportTypeResponse(savedSportType);
    }

    // TODO: Delete sport type
    @Transactional
    public void deleteSportType(UUID id) {
        SportType sportType = sportTypeRepository.findById(id).orElseThrow();

        // Xóa bảng giá trước để tránh lỗi khóa ngoại (nếu không dùng Cascade)
        List<CourtPrice> existingPrices = courtPriceRepository.findBySportTypeId(id);
        if (!existingPrices.isEmpty()) {
            courtPriceRepository.deleteAll(existingPrices);
        }
        sportTypeRepository.delete(sportType);
    }
}

