package com.jorgemonteiro.home_app.service.notifications

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.repository.notifications.MessageRepository
import com.jorgemonteiro.home_app.repository.notifications.NotificationRepository
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

@Title("Notification Service")
@Narrative("""
As a household member
I want to receive notifications and send messages to others
So that I can stay informed and coordinate household activities
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
class NotificationServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    NotificationService notificationService

    @Autowired
    NotificationRepository notificationRepository

    @Autowired
    MessageRepository messageRepository

    @Autowired
    UserRepository userRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should return all notifications for the user"() {
        when: "fetching notifications for receiver"
            def result = notificationService.getMyNotifications("receiver@example.com")

        then: "at least two notifications are returned"
            result.size() >= 2
            
        and: "the unread and read notifications from seed data are present"
            result.any { it.message.title == "Unread Notif" }
            result.any { it.message.title == "Read Notif" }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should update the status of a notification to read"() {
        given: "the receiver user and their unread notification"
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def unread = notificationRepository.findAll().find { it.getRecipient().getId() == receiver.getId() && !it.getIsRead() }
            assert unread != null

        when: "marking the notification as read"
            notificationService.markAsRead(unread.getId())

        then: "the status is updated in the database"
            notificationRepository.findById(unread.getId()).get().getIsRead()
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should persist a new notification correctly"() {
        given: "recipient and sender users"
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def sender = userRepository.findByEmail("sender@example.com").get()
            def initialCount = notificationRepository.count()

        when: "creating a new notification"
            notificationService.createNotification(receiver, sender, "MANUAL", "Manual Notif", "Hello content", "/link")

        then: "the total notification count increases"
            notificationRepository.count() == initialCount + 1
            
        and: "the last saved notification has correct details"
            def saved = notificationRepository.findAll().last()
            saved.getTitle() == "Manual Notif"
            saved.getMessage() == "Hello content"
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should return conversation messages and mark them as read"() {
        given: "the receiver and sender users"
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def sender = userRepository.findByEmail("sender@example.com").get()

        when: "fetching the conversation between them"
            def result = notificationService.getConversation("receiver@example.com", sender.getId())

        then: "the expected seeded message is returned"
            result.any { it.content == "Hello there!" }

        and: "all messages in that conversation are now marked as read"
            def conversationMessages = messageRepository.findAll().findAll { 
                it.getRecipient().getId() == receiver.getId() && it.getSender().getId() == sender.getId() 
            }
            conversationMessages.every { it.getIsRead() }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should create both message and notification when sending a message"() {
        given: "sender email and recipient user"
            def senderEmail = "sender@example.com"
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def initialNotifCount = notificationRepository.count()
            def initialMsgCount = messageRepository.count()

        when: "sending a new message"
            def result = notificationService.sendMessage(senderEmail, receiver.getId(), "How are you?")

        then: "the message is returned and saved"
            result.content == "How are you?"
            messageRepository.count() == initialMsgCount + 1

        and: " a new notification is created for the recipient"
            notificationRepository.count() == initialNotifCount + 1
            def lastNotif = notificationRepository.findAll().last()
            lastNotif.getRecipient().getId() == receiver.getId()
            lastNotif.getType() == "NEW_MESSAGE"
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should return correct count of unread notifications for a user"() {
        expect: "the seeded data has 1 unread notification for the receiver"
            notificationService.getUnreadCount("receiver@example.com") >= 1
    }

    def "should throw ObjectNotFoundException when user is invalid"() {
        when: "fetching notifications for unknown user"
            notificationService.getMyNotifications("unknown@example.com")
        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }
}
