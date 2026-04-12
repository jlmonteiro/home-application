package com.jorgemonteiro.home_app.controller.shopping

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO
import com.jorgemonteiro.home_app.service.shopping.ShoppingService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import groovy.json.JsonOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.transaction.annotation.Transactional
import spock.lang.Title

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Title("Coupon API Integration")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class CouponApiSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    ShoppingService shoppingService

    def "POST /api/shopping/stores/{id}/coupons should succeed when dueDate is sent as YYYY-MM-DD"() {
        given: "a store exists"
            def store = shoppingService.createStore(new ShoppingStoreDTO(name: "Test Store"))
            
        and: "a coupon request with a date-only dueDate"
            def couponJson = JsonOutput.toJson([
                name: "Test Coupon",
                dueDate: "2026-04-12", // Date only, now accepted by LocalDate in DTO
                barcodeType: "CODE_128"
            ])

        when: "posting to coupons endpoint"
            def response = mockMvc.perform(post("/api/shopping/stores/${store.id}/coupons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(couponJson)
                    .with(user("user")))

        then: "it returns 201 Created"
            response.andExpect(status().isCreated())
            
        and: "dueDate is correctly saved as start of day"
            def created = response.andReturn().response.contentAsString
            created.contains("2026-04-12")
    }
}
