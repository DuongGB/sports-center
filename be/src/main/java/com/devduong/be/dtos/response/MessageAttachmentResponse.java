package com.devduong.be.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageAttachmentResponse {
    String id;
    String fileUrl;
    String fileName;
    String fileType;
    Long fileSize;
}
