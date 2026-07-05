package com.sliit.library.dto;

import com.sliit.library.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private String relatedEntityType;
    private Long relatedEntityId;
    private LocalDateTime sentAt;
}
