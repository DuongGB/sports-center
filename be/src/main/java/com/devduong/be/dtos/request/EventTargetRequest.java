package com.devduong.be.dtos.request;

import java.util.UUID;

public record EventTargetRequest(
        UUID sportTypeId,
        UUID courtId
) {
}
