package com.jorgemonteiro.home_app.service.notifications;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.notifications.NotificationAdapter;
import com.jorgemonteiro.home_app.model.dtos.notifications.MessageDTO;
import com.jorgemonteiro.home_app.model.dtos.notifications.NotificationDTO;
import com.jorgemonteiro.home_app.model.entities.notifications.Message;
import com.jorgemonteiro.home_app.model.entities.notifications.Notification;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.repository.notifications.MessageRepository;
import com.jorgemonteiro.home_app.repository.notifications.NotificationRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing in-app notifications and direct messages.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ObjectNotFoundException("User with email " + email + " not found"));
        return notificationRepository.findAllByRecipientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(NotificationAdapter::toNotificationDTO)
                .collect(Collectors.toList());
    }

    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new ObjectNotFoundException("Notification with id " + id + " not found"));
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    public void createNotification(User recipient, User sender, String type, String title, String message, String link) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setSender(sender);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setLink(link);
        notificationRepository.save(n);
    }

    public void createBroadcastNotification(User sender, String type, String title, String message, String link) {
        List<User> allUsers = userRepository.findAll();
        allUsers.stream()
                .filter(u -> sender == null || !u.getId().equals(sender.getId()))
                .forEach(u -> createNotification(u, sender, type, title, message, link));
    }

    @Transactional
    public List<MessageDTO> getConversation(String myEmail, Long otherId) {
        User me = userRepository.findByEmail(myEmail).orElseThrow(() -> new ObjectNotFoundException("User with email " + myEmail + " not found"));
        List<Message> messages = messageRepository.findConversation(me.getId(), otherId);
        
        // Mark as read
        messages.stream()
                .filter(m -> m.getRecipient().getId().equals(me.getId()))
                .forEach(m -> m.setIsRead(true));

        return messages.stream()
                .map(NotificationAdapter::toMessageDTO)
                .collect(Collectors.toList());
    }

    public MessageDTO sendMessage(String senderEmail, Long recipientId, String content) {
        User sender = userRepository.findByEmail(senderEmail).orElseThrow(() -> new ObjectNotFoundException("User with email " + senderEmail + " not found"));
        User recipient = userRepository.findById(recipientId).orElseThrow(() -> new ObjectNotFoundException("User with id " + recipientId + " not found"));

        Message m = new Message();
        m.setSender(sender);
        m.setRecipient(recipient);
        m.setContent(content);

        // Also create a notification for the message
        createNotification(recipient, sender, "NEW_MESSAGE", "New Message from " + sender.getFirstName(), content, "/messages/" + sender.getId());

        return NotificationAdapter.toMessageDTO(messageRepository.save(m));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ObjectNotFoundException("User with email " + email + " not found"));
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }
}
