package com.jorgemonteiro.homeapp

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = HomeApplication.class)
class HomeAppApplicationSpec extends BaseIntegrationTest {

    def "application context loads"() {
        expect: "the application context loads successfully"
            true
    }

}
