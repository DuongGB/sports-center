/*
 * @ {#} RevenueOverviewResponse.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

/*
 * @description: DTO for revenue overview statistics
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
public record RevenueOverviewResponse(
        double totalRevenue,
        double monthRevenue,
        double revenueGrowthPercent,
        long totalBookings,
        long monthBookings,
        double bookingGrowthPercent,
        long totalUsers,
        long newUsersThisMonth,
        long activeCourts,
        long totalCourts
) {
}
