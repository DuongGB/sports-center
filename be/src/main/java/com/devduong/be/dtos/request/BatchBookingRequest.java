package com.devduong.be.dtos.request;

import java.util.List;
import java.util.UUID;

public record BatchBookingRequest(
    List<UUID> ids,
    String action
) {}
