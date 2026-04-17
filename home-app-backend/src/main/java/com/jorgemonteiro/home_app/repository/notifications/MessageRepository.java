package com.jorgemonteiro.home_app.repository.notifications;

import com.jorgemonteiro.home_app.model.entities.notifications.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Message} entity.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :u1 AND m.recipient.id = :u2) OR (m.sender.id = :u2 AND m.recipient.id = :u1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(Long u1, Long u2);

    long countByRecipientIdAndIsReadFalse(Long recipientId);
}
