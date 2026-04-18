package com.jorgemonteiro.home_app.controller.notifications

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.controller.notifications.resource.NotificationResource
import com.jorgemonteiro.home_app.repository.notifications.MessageRepository
import com.jorgemonteiro.home_app.repository.notifications.NotificationRepository
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import groovy.json.JsonOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.web.servlet.MockMvc
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import static org.springframework.hateoas.MediaTypes.HAL_JSON_VALUE
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("Notification API Integration")
@Narrative("""
As a client of the API
I want to interact with notifications and messaging endpoints
So that I can receive and send messages within the household
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
@Subject(NotificationController)
class NotificationControllerSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    NotificationRepository notificationRepository

    @Autowired
    MessageRepository messageRepository

    @Autowired
    UserRepository userRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "GET /api/notifications should return notifications for authenticated user"() {
        when: "authenticated user requests their notifications"
            def response = mockMvc.perform(get("/api/notifications")
                    .with(oauth2Login().attributes { it.put("email", "receiver@example.com") }))

        then: "response status and content type are correct"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))

        and: "the notifications are returned"
            response.andExpect(jsonPath('$._embedded.notifications').isArray())
                    .andExpect(jsonPath('$._embedded.notifications.length()').value(2))
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "POST /api/notifications/{id}/read should mark notification as read"() {
        given: "an unread notification"
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def unread = notificationRepository.findAll().find { 
                it.recipient.id == receiver.id && !it.isRead 
            }
            assert unread != null

        when: "authenticated user marks notification as read"
            def response = mockMvc.perform(post("/api/notifications/${unread.id}/read")
                    .with(oauth2Login().attributes { it.put("email", "receiver@example.com") }))

        then: "response is successful"
            response.andExpect(status().isOk())

        and: "notification is marked as read in database"
            notificationRepository.findById(unread.id).get().isRead
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "GET /api/notifications/unread-count should return unread count"() {
        when: "authenticated user requests unread count"
            def response = mockMvc.perform(get("/api/notifications/unread-count")
                    .with(oauth2Login().attributes { it.put("email", "receiver@example.com") }))

        then: "response is successful with correct count"
            response.andExpect(status().isOk())
                    .andExpect(content().string("1"))
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "GET /api/notifications/messages/{otherId} should return conversation"() {
        given: "sender and receiver users"
            def sender = userRepository.findByEmail("sender@example.com").get()

        when: "authenticated user requests conversation"
            def response = mockMvc.perform(get("/api/notifications/messages/${sender.id}")
                    .with(oauth2Login().attributes { it.put("email", "receiver@example.com") }))

        then: "response is successful"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))

        and: "conversation messages are returned"
            response.andExpect(jsonPath('$').isArray())
                    .andExpect(jsonPath('$[0].content').value("Hello there!"))
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "POST /api/notifications/messages/{recipientId} should send message"() {
        given: "recipient user"
            def receiver = userRepository.findByEmail("receiver@example.com").get()
            def initialMsgCount = messageRepository.count()
            def initialNotifCount = notificationRepository.count()

        when: "authenticated user sends a message"
            def messageDto = [content: "Test message content"]
            def response = mockMvc.perform(post("/api/notifications/messages/${receiver.id}")
                    .with(oauth2Login().attributes { it.put("email", "sender@example.com") })
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson(messageDto)))

        then: "response is successful"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))

        and: "message and notification are created"
            messageRepository.count() == initialMsgCount + 1
            notificationRepository.count() == initialNotifCount + 1
    }
}
