/*
 * @ {#} CourtMapper.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.mappers;

import com.devduong.be.dtos.response.CourtResponse;
import com.devduong.be.entities.Court;
import com.devduong.be.entities.CourtImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
@Mapper(componentModel = "spring")
public interface CourtMapper {
    @Mapping(source = "sportType.id", target = "sportTypeId")
    @Mapping(source = "sportType.name", target = "sportTypeName")
    @Mapping(source = "sportType.courtPrices", target = "prices")
    @Mapping(source = "courtAvailabilities", target = "availabilities")
    @Mapping(source = "courtImages", target = "courtImages", qualifiedByName = "mapCourtImagesToUrls")
    CourtResponse toCourtResponse(Court court);

    @Named("mapCourtImagesToUrls")
    default List<String> mapCourtImagesToUrls(List<CourtImage> courtImages) {
        if (courtImages == null) return null;
        return courtImages.stream()
                .map(CourtImage::getImageUrl)
                .toList();
    }
}

