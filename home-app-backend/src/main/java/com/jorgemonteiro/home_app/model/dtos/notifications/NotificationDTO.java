package com.jorgemonteiro.home_app.model.dtos.notifications;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.notifications.Notification}.
 */
@Data
@NoArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long recipientId;
    private Long senderId;
    private String senderName;
    private String type;
    private String title;
    private String message;
    private String link;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
