/*
 * @ {#} RevenueService.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.dtos.response.*;
import com.devduong.be.entities.Booking;
import com.devduong.be.enums.BookingStatus;
import com.devduong.be.enums.CourtStatus;
import com.devduong.be.repositories.BookingRepository;
import com.devduong.be.repositories.CourtRepository;
import com.devduong.be.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/*
 * @description: Service for revenue and statistics dashboard
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class RevenueService {
    BookingRepository bookingRepository;
    CourtRepository courtRepository;
    UserRepository userRepository;

    // ===== Tổng quan =====
    public RevenueOverviewResponse getOverview() {
        // Tổng doanh thu
        double totalRevenue = bookingRepository.sumTotalRevenue();

        // Doanh thu tháng này
        LocalDate now = LocalDate.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthEnd = now.plusMonths(1).withDayOfMonth(1).atStartOfDay();
        double monthRevenue = bookingRepository.sumRevenueByDateRange(monthStart, monthEnd);

        // Doanh thu tháng trước (để tính % tăng trưởng)
        LocalDateTime prevMonthStart = monthStart.minusMonths(1);
        LocalDateTime prevMonthEnd = monthStart;
        double prevMonthRevenue = bookingRepository.sumRevenueByDateRange(prevMonthStart, prevMonthEnd);
        double revenueGrowth = prevMonthRevenue > 0
                ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
                : (monthRevenue > 0 ? 100 : 0);

        // Tổng booking
        long totalBookings = bookingRepository.count();

        // Booking tháng này
        long monthBookings = bookingRepository.countBookingsByDateRange(monthStart, monthEnd);
        long prevMonthBookings = bookingRepository.countBookingsByDateRange(prevMonthStart, prevMonthEnd);
        double bookingGrowth = prevMonthBookings > 0
                ? ((double)(monthBookings - prevMonthBookings) / prevMonthBookings) * 100
                : (monthBookings > 0 ? 100 : 0);

        // Users
        long totalUsers = userRepository.count();
        long newUsersThisMonth = userRepository.countUsersCreatedAfter(monthStart);

        // Courts
        long activeCourts = courtRepository.countByStatus(CourtStatus.ACTIVE);
        long totalCourts = courtRepository.count();

        return new RevenueOverviewResponse(
                totalRevenue,
                monthRevenue,
                Math.round(revenueGrowth * 10.0) / 10.0,
                totalBookings,
                monthBookings,
                Math.round(bookingGrowth * 10.0) / 10.0,
                totalUsers,
                newUsersThisMonth,
                activeCourts,
                totalCourts
        );
    }

    // ===== Doanh thu theo tháng (cho biểu đồ đường) =====
    public List<MonthlyRevenueResponse> getMonthlyRevenue(int year) {
        List<Object[]> rawData = bookingRepository.findMonthlyRevenue(year);

        // Build map từ dữ liệu thực
        Map<Integer, Object[]> dataMap = new HashMap<>();
        for (Object[] row : rawData) {
            int month = ((Number) row[0]).intValue();
            dataMap.put(month, row);
        }

        // Tạo danh sách 12 tháng (kể cả tháng không có dữ liệu)
        String[] monthLabels = {"Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
                "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"};

        List<MonthlyRevenueResponse> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            Object[] data = dataMap.get(m);
            double revenue = data != null ? ((Number) data[1]).doubleValue() : 0;
            long count = data != null ? ((Number) data[2]).longValue() : 0;
            result.add(new MonthlyRevenueResponse(m, monthLabels[m - 1], revenue, count));
        }
        return result;
    }

    // ===== Doanh thu 7 ngày gần nhất =====
    public List<WeeklyRevenueResponse> getWeeklyRevenue() {
        LocalDate today = LocalDate.now();
        LocalDate fromDate = today.minusDays(6);

        List<Object[]> rawData = bookingRepository.findDailyRevenue(fromDate, today);

        // Build map
        Map<LocalDate, Object[]> dataMap = new HashMap<>();
        for (Object[] row : rawData) {
            LocalDate date = (LocalDate) row[0];
            dataMap.put(date, row);
        }

        // Tạo danh sách 7 ngày
        List<WeeklyRevenueResponse> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = fromDate.plusDays(i);
            Object[] data = dataMap.get(date);
            double revenue = data != null ? ((Number) data[1]).doubleValue() : 0;
            long count = data != null ? ((Number) data[2]).longValue() : 0;

            String dayLabel = date.getDayOfWeek()
                    .getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi"));
            // Capitalize first letter
            dayLabel = dayLabel.substring(0, 1).toUpperCase() + dayLabel.substring(1);

            result.add(new WeeklyRevenueResponse(date, dayLabel, revenue, count));
        }
        return result;
    }

    // ===== Thống kê booking theo trạng thái (cho biểu đồ tròn) =====
    public List<BookingStatusStatsResponse> getBookingsByStatus() {
        List<Object[]> rawData = bookingRepository.countByStatus();

        Map<String, String> statusLabels = Map.of(
                "PENDING", "Chờ xác nhận",
                "CONFIRMED", "Đã xác nhận",
                "CANCELLED", "Đã hủy",
                "COMPLETED", "Hoàn thành"
        );

        return rawData.stream()
                .map(row -> {
                    String status = ((BookingStatus) row[0]).name();
                    long count = ((Number) row[1]).longValue();
                    String label = statusLabels.getOrDefault(status, status);
                    return new BookingStatusStatsResponse(status, label, count);
                })
                .collect(Collectors.toList());
    }

    // ===== Doanh thu theo loại sân (cho biểu đồ cột) =====
    public List<SportTypeRevenueResponse> getRevenueBySportType() {
        List<Object[]> rawData = bookingRepository.findRevenueBySportType();
        return rawData.stream()
                .map(row -> new SportTypeRevenueResponse(
                        (UUID) row[0],
                        (String) row[1],
                        ((Number) row[2]).doubleValue(),
                        ((Number) row[3]).longValue()
                ))
                .collect(Collectors.toList());
    }

    // ===== Top sân doanh thu cao nhất =====
    public List<TopCourtRevenueResponse> getTopCourts(int limit) {
        List<Object[]> rawData = bookingRepository.findTopCourtsByRevenue(PageRequest.of(0, limit));
        return rawData.stream()
                .map(row -> new TopCourtRevenueResponse(
                        (UUID) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).doubleValue(),
                        ((Number) row[5]).longValue()
                ))
                .collect(Collectors.toList());
    }

    // ===== Booking gần đây =====
    public List<RecentBookingResponse> getRecentBookings() {
        List<Booking> bookings = bookingRepository.findTop10ByOrderByCreatedAtDesc();
        return bookings.stream()
                .map(b -> {
                    String customerName = b.getUser() != null
                            ? b.getUser().getFullName()
                            : (b.getBookingGuest() != null ? b.getBookingGuest().getFullName() : "N/A");
                    return new RecentBookingResponse(
                            b.getId(),
                            customerName,
                            b.getCourt().getName(),
                            b.getBookingDate(),
                            b.getStartTime(),
                            b.getEndTime(),
                            b.getTotalPrice(),
                            b.getBookingStatus(),
                            b.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }
}
