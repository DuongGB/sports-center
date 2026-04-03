/*
 * @ {#} CourtMapper.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.mappers;

import com.devduong.be.dtos.response.CourtResponse;
import com.devduong.be.entities.Court;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
@Mapper(componentModel = "spring")
public interface CourtMapper {
    @Mapping(source = "sportType.id" ,target = "sportTypeId")
    @Mapping(source = "sportType.name" ,target = "sportTypeName")
    CourtResponse toCourtResponse(Court court);
}

