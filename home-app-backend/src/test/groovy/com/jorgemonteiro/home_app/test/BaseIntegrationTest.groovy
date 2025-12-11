package com.jorgemonteiro.home_app.test

import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import spock.lang.Shared
import spock.lang.Specification

@Testcontainers
abstract class BaseIntegrationTest extends Specification {

    @Container
    @ServiceConnection
    @Shared
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("mydatabase")
            .withUsername("myuser")
            .withPassword("secret")
}
