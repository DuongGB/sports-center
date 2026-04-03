/*
 * @ {#} BookingMapper.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.mappers;

import com.devduong.be.dtos.response.BookingResponse;
import com.devduong.be.entities.Booking;
import com.devduong.be.entities.Payment;
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
    @Mapping(source = "booking.id", target = "bookingId")
    @Mapping(source = "booking.court.name", target = "courtName")
    @Mapping(source = "booking.timeSlot.startTime", target = "startTime")
    @Mapping(source = "booking.timeSlot.endTime", target = "endTime")
    @Mapping(source = "booking.bookingStatus", target = "bookingStatus")
    @Mapping(source = "payment.id", target = "paymentId")
    @Mapping(source = "payment.paymentMethod", target = "paymentMethod")
    @Mapping(source = "payment.paymentStatus", target = "paymentStatus")
    BookingResponse toBookingResponse(Booking booking, Payment payment);
}
