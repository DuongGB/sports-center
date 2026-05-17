package com.devduong.be.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;
@AllArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QrResponse {
    String token;
    Instant expiredAt;
}
