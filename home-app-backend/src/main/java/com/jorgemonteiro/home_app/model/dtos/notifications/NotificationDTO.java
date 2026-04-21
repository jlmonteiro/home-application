package com.jorgemonteiro.home_app.model.dtos.notifications;

import com.jorgemonteiro.home_app.model.dtos.shared.UserSummaryDTO;
import lombok.AllArgsConstructor;
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
    private UserSummaryDTO recipient;
    private UserSummaryDTO sender;
    private String type;
    private Message message;
    private String link;
    private Boolean isRead;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String title;
        private String content;
    }
}
