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
@Subject(NotificationService)
class NotificationServiceSpec extends BaseIntegrationTest {

    @Autowired
    NotificationService notificationService

    @Autowired
    NotificationRepository notificationRepository

    @Autowired
    MessageRepository messageRepository

    @Autowired
    UserRepository userRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "getMyNotifications should return all notifications for the user"() {
        when: "fetching notifications for receiver"
            def result = notificationService.getMyNotifications("receiver@example.com")

        then: "two notifications are returned"
            result.size() >= 2
            result.any { it.message.title == "Unread Notif" }
            result.any { it.message.title == "Read Notif" }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "markAsRead should update the notification status"() {
        given: "an unread notification"
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def unread = notificationRepository.findAll().find { it.getRecipient().getId() == receiver.getId() && !it.getIsRead() }

        when: "marking as read"
            notificationService.markAsRead(unread.getId())

        then: "it is marked as read in the repository"
            notificationRepository.findById(unread.getId()).get().getIsRead()
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "createNotification should persist a new notification"() {
        given: "initial notification count"
            def initialCount = notificationRepository.count()
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def sender = userRepository.findByEmail("sender@example.com").get()

        when: "creating a notification"
            notificationService.createNotification(receiver, sender, "MANUAL", "Manual Notif", "Hello", "/link")

        then: "it is saved"
            notificationRepository.count() == initialCount + 1
            def saved = notificationRepository.findAll().last()
            saved.getTitle() == "Manual Notif"
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "getConversation should return messages and mark them as read"() {
        given: "the IDs"
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def sender = userRepository.findByEmail("sender@example.com").get()

        when: "fetching the conversation"
            def result = notificationService.getConversation("receiver@example.com", sender.getId())

        then: "the message is returned"
            result.any { it.content == "Hello there!" }

        and: "the messages are now marked as read"
            messageRepository.findAll().findAll { it.getRecipient().getId() == receiver.getId() && it.getSender().getId() == sender.getId() }.every { it.getIsRead() }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "sendMessage should create both message and notification"() {
        given: "initial counts"
            def initialNotifCount = notificationRepository.count()
            def initialMsgCount = messageRepository.count()
            def receiver = userRepository.findByEmail("receiver@example.com").get()

        when: "sending a message"
            def result = notificationService.sendMessage("sender@example.com", receiver.getId(), "How are you?")

        then: "message is returned and saved"
            result.content == "How are you?"
            messageRepository.count() == initialMsgCount + 1

        and: "a new notification is created for the recipient"
            notificationRepository.count() == initialNotifCount + 1
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "getUnreadCount should return correct count of unread notifications"() {
        expect:
            notificationService.getUnreadCount("receiver@example.com") >= 1
    }

    def "getMyNotifications should throw ObjectNotFoundException for invalid user"() {
        when:
            notificationService.getMyNotifications("unknown@example.com")
        then:
            thrown(ObjectNotFoundException)
    }
}
