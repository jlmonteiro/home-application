package com.jorgemonteiro.home_app.controller.notifications.resource;

import com.jorgemonteiro.home_app.model.dtos.notifications.NotificationDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDateTime;

@Getter
@Setter
@Relation(collectionRelation = "notifications", itemRelation = "notification")
public class NotificationResource extends EntityModel<NotificationDTO> {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String link;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String senderName;

    public NotificationResource(NotificationDTO dto) {
        this.id = dto.getId();
        this.type = dto.getType();
        this.title = dto.getTitle();
        this.message = dto.getMessage();
        this.link = dto.getLink();
        this.isRead = dto.getIsRead();
        this.createdAt = dto.getCreatedAt();
        this.senderName = dto.getSenderName();
    }
}
