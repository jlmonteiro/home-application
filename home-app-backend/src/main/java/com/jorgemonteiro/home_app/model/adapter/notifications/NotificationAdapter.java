package com.jorgemonteiro.home_app.model.adapter.notifications;

import com.jorgemonteiro.home_app.model.dtos.notifications.MessageDTO;
import com.jorgemonteiro.home_app.model.dtos.notifications.NotificationDTO;
import com.jorgemonteiro.home_app.model.entities.notifications.Message;
import com.jorgemonteiro.home_app.model.entities.notifications.Notification;

/**
 * Adapter for converting between Notification entities and DTOs.
 */
public class NotificationAdapter {

    public static NotificationDTO toNotificationDTO(Notification entity) {
        if (entity == null) return null;
        NotificationDTO dto = new NotificationDTO();
        dto.setId(entity.getId());
        dto.setRecipientId(entity.getRecipient().getId());
        dto.setType(entity.getType());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setLink(entity.getLink());
        dto.setIsRead(entity.getIsRead());
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getSender() != null) {
            dto.setSenderId(entity.getSender().getId());
            dto.setSenderName(entity.getSender().getFirstName() + " " + entity.getSender().getLastName());
        }
        return dto;
    }

    public static MessageDTO toMessageDTO(Message entity) {
        if (entity == null) return null;
        MessageDTO dto = new MessageDTO();
        dto.setId(entity.getId());
        dto.setSenderId(entity.getSender().getId());
        dto.setSenderName(entity.getSender().getFirstName() + " " + entity.getSender().getLastName());
        dto.setRecipientId(entity.getRecipient().getId());
        dto.setRecipientName(entity.getRecipient().getFirstName() + " " + entity.getRecipient().getLastName());
        dto.setContent(entity.getContent());
        dto.setIsRead(entity.getIsRead());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
