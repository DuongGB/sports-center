/*
 * @ {#} SportTypeService.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.request.SportTypeRequest;
import com.devduong.be.dtos.response.SportTypeResponse;
import com.devduong.be.entities.SportType;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.SportTypeMapper;
import com.devduong.be.repositories.SportTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

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
    SportTypeMapper sportTypeMapper;

    // TODO: Get all sport types
    public List<SportTypeResponse> getAllSportTypes() {
        List<SportType> sportTypes = sportTypeRepository.findAll();
        return sportTypes.stream()
                .map(sportTypeMapper::toSportTypeResponse)
                .toList();
    }

    // TODO: Get sport type by id
    public SportTypeResponse getSportTypeById(UUID id) {
        SportType sportType = sportTypeRepository.findById(id)
                .orElseThrow();
        return sportTypeMapper.toSportTypeResponse(sportType);
    }

    // TODO: Create new sport type
    public SportTypeResponse createSportType(SportTypeRequest request) {
        if (sportTypeRepository.findByName(request.name()).isPresent()) {
            throw new AppException(ErrorCode.SPORT_TYPE_EXISTS);
        }
        SportType sportType = SportType.builder()
                .name(request.name())
                .build();
        sportTypeRepository.save(sportType);
        return sportTypeMapper.toSportTypeResponse(sportType);
    }

    // TODO: Update sport type
    public SportTypeResponse updateSportType(UUID id, SportTypeRequest request) {
        SportType sportType = sportTypeRepository.findById(id)
                .orElseThrow();
        if (sportTypeRepository.findByName(request.name()).isPresent()) {
            throw new AppException(ErrorCode.SPORT_TYPE_EXISTS);
        }
        sportType.setName(request.name());
        sportTypeRepository.save(sportType);
        return sportTypeMapper.toSportTypeResponse(sportType);
    }

    // TODO: Delete sport type
    public void deleteSportType(UUID id) {
        SportType sportType = sportTypeRepository.findById(id)
                .orElseThrow();
        sportTypeRepository.delete(sportType);
    }
}

