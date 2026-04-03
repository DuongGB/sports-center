/*
 * @ {#} CourtPriceMapper.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.mappers;

import com.devduong.be.dtos.response.CourtPriceResponse;
import com.devduong.be.entities.CourtPrice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
@Mapper(componentModel = "spring")
public interface CourtPriceMapper {
    @Mapping(source = "court.id", target = "courtId")
    @Mapping(source = "court.name", target = "courtName")
    @Mapping(source = "timeSlot.id", target = "timeSlotId")
    @Mapping(source = "timeSlot.startTime", target = "startTime")
    @Mapping(source = "timeSlot.endTime", target = "endTime")
    CourtPriceResponse toCourtPriceResponse(CourtPrice courtPrice);
}
