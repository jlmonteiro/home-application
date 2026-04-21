package com.jorgemonteiro.home_app.service.profiles

import com.github.tomakehurst.wiremock.WireMockServer
import com.github.tomakehurst.wiremock.client.WireMock
import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.AuthenticationException
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import spock.lang.Narrative
import spock.lang.Shared
import spock.lang.Subject
import spock.lang.Title

import java.time.LocalDate

import static com.github.tomakehurst.wiremock.client.WireMock.*
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig

@Title("Google People Service")
@Narrative("""
As a system,
I want to fetch user birthdays from Google People API,
so that I can automatically classify users into age groups.
""")
@SpringBootTest(classes = [HomeApplication], webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = [
    "spring.cloud.openfeign.client.config.google-people-api.url=http://localhost:8089",
    "spring.main.allow-bean-definition-overriding=true"
])
@ActiveProfiles("test")
@Subject(GooglePeopleService)
class GooglePeopleServiceSpec extends BaseIntegrationTest {

    @Shared
    WireMockServer wireMockServer = new WireMockServer(wireMockConfig().port(8089))

    @Autowired
    GooglePeopleService googlePeopleService

    def setupSpec() {
        wireMockServer.start()
        configureFor("localhost", 8089)
    }

    def cleanupSpec() {
        wireMockServer.stop()
    }

    def setup() {
        wireMockServer.resetAll()
    }

    def "should successfully fetch birthdate from Google"() {
        given: "a valid access token"
            def token = "valid-token"

        and: "Google People API returns a valid birthday"
            wireMockServer.stubFor(get(urlPathEqualTo("/people/me"))
                    .withQueryParam("personFields", equalTo("birthdays"))
                    .withHeader("Authorization", equalTo("Bearer " + token))
                    .willReturn(aResponse()
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                {
                                  "birthdays": [
                                    {
                                      "date": {
                                        "year": 1990,
                                        "month": 5,
                                        "day": 15
                                      }
                                    }
                                  ]
                                }
                            """)))

        when: "fetching the birthdate"
            def result = googlePeopleService.fetchBirthdate(token)

        then: "the correct date is returned"
            result.isPresent()
            result.get() == LocalDate.of(1990, 5, 15)
    }

    def "should return empty Optional if Google returns no birthdays"() {
        given: "a valid token but no birthday data in Google"
            wireMockServer.stubFor(get(urlPathEqualTo("/people/me"))
                    .willReturn(aResponse()
                            .withHeader("Content-Type", "application/json")
                            .withBody(""" { "birthdays": [] } """)))

        when: "fetching the birthdate"
            def result = googlePeopleService.fetchBirthdate("token")

        then: "Optional is empty"
            result.isEmpty()
    }

    def "should throw AuthenticationException on 401 from Google"() {
        given: "an expired or invalid token"
            wireMockServer.stubFor(get(urlPathEqualTo("/people/me"))
                    .willReturn(aResponse().withStatus(401)))

        when: "fetching the birthdate"
            googlePeopleService.fetchBirthdate("bad-token")

        then: "AuthenticationException is thrown"
            thrown(AuthenticationException)
    }

    def "should return empty Optional on 500 server error from Google"() {
        given: "a transient error on Google's side"
            wireMockServer.stubFor(get(urlPathEqualTo("/people/me"))
                    .willReturn(aResponse().withStatus(500)))

        when: "fetching the birthdate"
            def result = googlePeopleService.fetchBirthdate("token")

        then: "Optional is empty (graceful degradation)"
            result.isEmpty()
    }
}
