/*
 * @ {#} BookingRepository.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.Booking;
import com.devduong.be.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/23/2026
 * @version:    1.0
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    // TODO: Kiểm tra xem sân có bị trùng giờ không (bỏ qua các đơn đã CANCELLED)
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.court.id = :courtId " +
            "AND b.bookingDate = :date " +
            "AND b.bookingStatus != 'CANCELLED' " +
            "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    boolean existsOverlappingBooking(
            @Param("courtId") UUID courtId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
            "AND b.bookingDate = :date " +
            "AND b.bookingStatus != 'CANCELLED' " +
            "ORDER BY b.startTime ASC")
    List<Booking> findActiveBookingsByCourtAndDate(
            @Param("courtId") UUID courtId,
            @Param("date") LocalDate date);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // ===== Revenue Statistics Queries =====

    // Tổng doanh thu từ booking CONFIRMED hoặc COMPLETED
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b " +
            "WHERE b.bookingStatus IN ('CONFIRMED', 'COMPLETED')")
    double sumTotalRevenue();

    // Doanh thu trong khoảng thời gian (theo createdAt)
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b " +
            "WHERE b.bookingStatus IN ('CONFIRMED', 'COMPLETED') " +
            "AND b.createdAt >= :from AND b.createdAt < :to")
    double sumRevenueByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // Số lượng booking trong khoảng thời gian
    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.createdAt >= :from AND b.createdAt < :to")
    long countBookingsByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // Doanh thu theo tháng trong năm (cho biểu đồ đường)
    @Query("SELECT MONTH(b.createdAt) AS m, COALESCE(SUM(b.totalPrice), 0), COUNT(b) " +
            "FROM Booking b " +
            "WHERE b.bookingStatus IN ('CONFIRMED', 'COMPLETED') " +
            "AND YEAR(b.createdAt) = :year " +
            "GROUP BY MONTH(b.createdAt) " +
            "ORDER BY m")
    List<Object[]> findMonthlyRevenue(@Param("year") int year);

    // Doanh thu theo ngày (cho biểu đồ 7 ngày gần nhất)
    @Query("SELECT b.bookingDate, COALESCE(SUM(b.totalPrice), 0), COUNT(b) " +
            "FROM Booking b " +
            "WHERE b.bookingStatus IN ('CONFIRMED', 'COMPLETED') " +
            "AND b.bookingDate >= :fromDate AND b.bookingDate <= :toDate " +
            "GROUP BY b.bookingDate " +
            "ORDER BY b.bookingDate")
    List<Object[]> findDailyRevenue(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    // Thống kê booking theo trạng thái
    @Query("SELECT b.bookingStatus, COUNT(b) FROM Booking b GROUP BY b.bookingStatus")
    List<Object[]> countByStatus();

    // Doanh thu theo loại sân (sport type)
    @Query("SELECT b.court.sportType.id, b.court.sportType.name, COALESCE(SUM(b.totalPrice), 0), COUNT(b) " +
            "FROM Booking b " +
            "WHERE b.bookingStatus IN ('CONFIRMED', 'COMPLETED') " +
            "GROUP BY b.court.sportType.id, b.court.sportType.name " +
            "ORDER BY SUM(b.totalPrice) DESC")
    List<Object[]> findRevenueBySportType();

    // Top sân có doanh thu cao nhất
    @Query("SELECT b.court.id, b.court.name, b.court.sportType.name, b.court.location, " +
            "COALESCE(SUM(b.totalPrice), 0), COUNT(b) " +
            "FROM Booking b " +
            "WHERE b.bookingStatus IN ('CONFIRMED', 'COMPLETED') " +
            "GROUP BY b.court.id, b.court.name, b.court.sportType.name, b.court.location " +
            "ORDER BY SUM(b.totalPrice) DESC")
    List<Object[]> findTopCourtsByRevenue(Pageable pageable);

    // Lấy booking gần đây
    List<Booking> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT b FROM Booking b LEFT JOIN b.user u LEFT JOIN b.bookingGuest g " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(COALESCE(u.fullName, g.fullName, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "COALESCE(u.phone, g.phone, '') LIKE CONCAT('%', :keyword, '%')) " +
            "AND (:status IS NULL OR b.bookingStatus = :status)")
    Page<Booking> findWithFilter(
            @Param("keyword") String keyword,
            @Param("status") BookingStatus status,
            Pageable pageable
    );

    List<Booking> findByBookingStatus(BookingStatus status);

    List<Booking> findByBookingStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime dateTime);

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<Booking> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}
