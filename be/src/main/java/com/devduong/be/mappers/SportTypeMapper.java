/*
 * @ {#} SportTypeMapper.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.mappers;

import com.devduong.be.dtos.response.SportTypeResponse;
import com.devduong.be.entities.SportType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/18/2026
 * @version:    1.0
 */
@Mapper(componentModel = "spring")
public interface SportTypeMapper {
    @Mapping(source = "courtPrices", target = "prices")
    SportTypeResponse toSportTypeResponse(SportType sportType);
}
