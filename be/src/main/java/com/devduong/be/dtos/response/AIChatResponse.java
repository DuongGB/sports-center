package com.devduong.be.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AIChatResponse {
    String reply;
    List<CourtSuggestion> courts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CourtSuggestion {
        String id;
        String name;
        String location;
        String sportType;
        String openTime;
        String closeTime;
        String status;
        List<PriceInfo> prices;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PriceInfo {
        String startTime;
        String endTime;
        double price;
    }
}
