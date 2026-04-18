package com.jorgemonteiro.home_app.model.dtos.notifications;

import com.jorgemonteiro.home_app.model.dtos.shared.UserSummaryDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.notifications.Message}.
 */
@Data
@NoArgsConstructor
public class MessageDTO {
    private Long id;
    private UserSummaryDTO sender;
    private UserSummaryDTO recipient;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
