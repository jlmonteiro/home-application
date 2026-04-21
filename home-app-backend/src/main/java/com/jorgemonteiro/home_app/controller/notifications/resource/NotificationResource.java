package com.jorgemonteiro.home_app.controller.notifications.resource;

import com.jorgemonteiro.home_app.model.dtos.notifications.NotificationDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDateTime;

@Getter
@Setter
@Relation(collectionRelation = "notifications", itemRelation = "notification")
public class NotificationResource extends RepresentationModel<NotificationResource> {
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
        if (dto.getMessage() != null) {
            this.title = dto.getMessage().getTitle();
            this.message = dto.getMessage().getContent();
        }
        this.link = dto.getLink();
        this.isRead = dto.getIsRead() != null ? dto.getIsRead() : false;
        this.createdAt = dto.getCreatedAt();
        if (dto.getSender() != null) {
            this.senderName = dto.getSender().getName();
        }
    }
}
