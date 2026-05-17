package com.devduong.be.dtos.response;

import java.util.UUID;

public record EventTargetResponse(
        UUID id,
        UUID sportTypeId,
        String sportTypeName,
        UUID courtId,
        String courtName
) {
}
