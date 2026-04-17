package com.jorgemonteiro.home_app.controller.notifications;

import com.jorgemonteiro.home_app.model.dtos.notifications.MessageDTO;
import com.jorgemonteiro.home_app.model.dtos.notifications.NotificationDTO;
import com.jorgemonteiro.home_app.service.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for notifications and messaging.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationDTO> getMyNotifications(@AuthenticationPrincipal OAuth2User principal) {
        return notificationService.getMyNotifications(principal.getAttribute("email"));
    }

    @PutMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(@AuthenticationPrincipal OAuth2User principal) {
        return notificationService.getUnreadCount(principal.getAttribute("email"));
    }

    @GetMapping("/messages/{otherId}")
    public List<MessageDTO> getConversation(@AuthenticationPrincipal OAuth2User principal, @PathVariable Long otherId) {
        return notificationService.getConversation(principal.getAttribute("email"), otherId);
    }

    @PostMapping("/messages/{recipientId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageDTO sendMessage(
            @AuthenticationPrincipal OAuth2User principal, 
            @PathVariable Long recipientId, 
            @RequestBody MessageDTO dto) {
        return notificationService.sendMessage(principal.getAttribute("email"), recipientId, dto.getContent());
    }
}
