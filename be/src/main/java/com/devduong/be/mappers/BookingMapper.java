/*
 * @ {#} BookingMapper.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.mappers;

import com.devduong.be.dtos.response.BookingResponse;
import com.devduong.be.dtos.response.PaymentExecutionResult;
import com.devduong.be.entities.Booking;
import com.devduong.be.entities.Payment;
import com.devduong.be.enums.PaymentMethod;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/23/2026
 * @version:    1.0
 */
@Mapper(componentModel = "spring")
public interface BookingMapper {
    @Mapping(source = "booking.id", target = "id")
    @Mapping(source = "booking.court.id", target = "courtId")
    @Mapping(source = "booking.court.name", target = "courtName")
    @Mapping(source = "paymentResult.paymentId", target = "paymentId")
    @Mapping(source = "paymentResult.paymentStatus", target = "paymentStatus")
    @Mapping(source = "paymentResult.paymentUrl", target = "paymentUrl")
    @Mapping(source = "paymentMethod", target = "paymentMethod")
    @Mapping(target = "customerName", expression = "java(booking.getUser() != null ? booking.getUser().getFullName() : (booking.getBookingGuest() != null ? booking.getBookingGuest().getFullName() : null))")
    @Mapping(target = "customerPhone", expression = "java(booking.getUser() != null ? booking.getUser().getPhone() : (booking.getBookingGuest() != null ? booking.getBookingGuest().getPhone() : null))")
    BookingResponse toBookingResponse(Booking booking, PaymentExecutionResult paymentResult, PaymentMethod paymentMethod);
}
