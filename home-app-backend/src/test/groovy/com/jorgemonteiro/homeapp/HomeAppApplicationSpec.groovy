package com.jorgemonteiro.homeapp

import org.springframework.boot.test.context.SpringBootTest
import spock.lang.Specification

@SpringBootTest
class HomeAppApplicationSpec extends Specification {

    def "application context loads"() {
        expect: "the application context loads successfully"
            true
    }

    def "basic arithmetic works"() {
        given: "two numbers"
            def a = 2
            def b = 3

        when: "we add them"
            def result = a + b

        then: "the result is correct"
            result == 5
    }
}
