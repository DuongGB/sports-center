package com.devduong.be.dtos.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

public record BookedSlotResponse(
        @JsonFormat(pattern = "HH:mm")
        LocalTime startTime,
        
        @JsonFormat(pattern = "HH:mm")
        LocalTime endTime
) {}
