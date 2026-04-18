package com.jorgemonteiro.home_app.controller.notifications;

import com.jorgemonteiro.home_app.controller.notifications.resource.NotificationResource;
import com.jorgemonteiro.home_app.controller.notifications.resource.NotificationResourceAssembler;
import com.jorgemonteiro.home_app.model.dtos.notifications.MessageDTO;
import com.jorgemonteiro.home_app.service.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.ResponseEntity;
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
    private final NotificationResourceAssembler resourceAssembler;

    @GetMapping
    public CollectionModel<NotificationResource> getMyNotifications(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        return resourceAssembler.toCollectionModel(notificationService.getMyNotifications(email));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(@AuthenticationPrincipal OAuth2User principal) {
        return notificationService.getUnreadCount(principal.getAttribute("email"));
    }

    @GetMapping("/messages/{otherId}")
    public List<MessageDTO> getConversation(@PathVariable Long otherId, @AuthenticationPrincipal OAuth2User principal) {
        return notificationService.getConversation(principal.getAttribute("email"), otherId);
    }

    @PostMapping("/messages/{recipientId}")
    public MessageDTO sendMessage(@PathVariable Long recipientId, @RequestBody MessageDTO dto, @AuthenticationPrincipal OAuth2User principal) {
        return notificationService.sendMessage(principal.getAttribute("email"), recipientId, dto.getContent());
    }
}
