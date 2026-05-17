/*
 * @ {#} CourtAvailabilityMapper.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.mappers;

import com.devduong.be.dtos.response.CourtAvailabilityResponse;
import com.devduong.be.entities.CourtAvailability;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
@Mapper(componentModel = "spring")
public interface CourtAvailabilityMapper {
    CourtAvailabilityResponse toCourtAvailabilityResponse(CourtAvailability courtAvailability);
}

