package com.devduong.be.mappers;

import com.devduong.be.dtos.response.EventResponse;
import com.devduong.be.dtos.response.EventTargetResponse;
import com.devduong.be.entities.Event;
import com.devduong.be.entities.EventTarget;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapper {

    @Mapping(source = "createdByUser.fullName", target = "createdByName")
    @Mapping(source = "targets", target = "targets")
    EventResponse toEventResponse(Event event);

    @Mapping(source = "sportType.id", target = "sportTypeId")
    @Mapping(source = "sportType.name", target = "sportTypeName")
    @Mapping(source = "court.id", target = "courtId")
    @Mapping(source = "court.name", target = "courtName")
    EventTargetResponse toEventTargetResponse(EventTarget eventTarget);

    List<EventTargetResponse> toEventTargetResponses(List<EventTarget> eventTargets);
}
