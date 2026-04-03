/*
 * @ {#} TimeSlotService.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.request.TimeSlotRequest;
import com.devduong.be.dtos.response.TimeSlotResponse;
import com.devduong.be.entities.TimeSlot;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.TimeSlotMapper;
import com.devduong.be.repositories.TimeSlotRepository;
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
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class TimeSlotService {
    TimeSlotRepository timeSlotRepository;
    TimeSlotMapper timeSlotMapper;

    // TODO: Get all các khung giờ ( Dùng cho dropdown trên FE)
    public List<TimeSlotResponse> getAllTimeSlots() {
        return timeSlotRepository.findAll().stream()
                .map(timeSlotMapper::toTimeSlotResponse)
                .toList();
    }

    // TODO: Create khung giờ ( Dùng cho admin tạo khung giờ mới)
    @Transactional
    public TimeSlotResponse createTimeSlot(TimeSlotRequest request) {
        // Check logic thời gian hợp lệ (startTime phải trước endTime)
        if (request.startTime().isAfter(request.endTime())) {
            throw new AppException(ErrorCode.INVALID_TIME_SLOT);
        }
        // Check khung giờ có bị trùng với khung giờ đã tồn tại không
        if (timeSlotRepository.existsByStartTimeAndEndTime(request.startTime(), request.endTime())) {
            throw new AppException(ErrorCode.TIME_SLOT_EXISTS);
        }
        // Check startTime và endTime không được bằng nhau
        if(request.startTime().equals(request.endTime())) {
            throw new AppException(ErrorCode.INVALID_TIME_SLOT);
        }
        TimeSlot timeSlot = TimeSlot.builder()
                .startTime(request.startTime())
                .endTime(request.endTime())
                .build();
        return timeSlotMapper.toTimeSlotResponse(timeSlotRepository.save(timeSlot));
    }

    // TODO: Update khung giờ ( Dùng cho admin cập nhật khung giờ)
    @Transactional
    public TimeSlotResponse updateTimeSlot(UUID id, TimeSlotRequest request) {
        // Check logic thời gian hợp lệ (startTime phải trước endTime)
        if (request.startTime().isAfter(request.endTime())) {
            throw new AppException(ErrorCode.INVALID_TIME_SLOT);
        }
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TIME_SLOT_NOT_FOUND));
        // Check khung giờ có bị trùng với khung giờ đã tồn tại không
        if (timeSlotRepository.existsByStartTimeAndEndTime(request.startTime(), request.endTime())) {
            throw new AppException(ErrorCode.TIME_SLOT_EXISTS);
        }
        timeSlot.setStartTime(request.startTime());
        timeSlot.setEndTime(request.endTime());
        return timeSlotMapper.toTimeSlotResponse(timeSlotRepository.save(timeSlot));
    }

    // TODO: Xóa khung giờ ( Dùng cho admin xóa khung giờ)
    @Transactional
    public void deleteTimeSlot(UUID id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TIME_SLOT_NOT_FOUND));
        timeSlotRepository.delete(timeSlot);
    }
}

