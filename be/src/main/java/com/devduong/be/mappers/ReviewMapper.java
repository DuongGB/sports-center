package com.devduong.be.mappers;

import com.devduong.be.dtos.response.ReviewResponse;
import com.devduong.be.entities.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    ReviewResponse toReviewResponse(Review review);
}
