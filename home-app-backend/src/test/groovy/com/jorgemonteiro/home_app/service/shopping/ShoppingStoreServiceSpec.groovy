package com.jorgemonteiro.home_app.service.shopping

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO
import com.jorgemonteiro.home_app.model.dtos.shared.StoreSummaryDTO
import com.jorgemonteiro.home_app.repository.shopping.ShoppingStoreRepository
import com.jorgemonteiro.home_app.service.shopping.ShoppingStoreService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import org.springframework.data.domain.PageRequest
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title
import org.springframework.test.context.ActiveProfiles

import java.time.LocalDate

@Title("Shopping Store Service")
@Narrative("""
As a household member
I want to manage stores, loyalty cards, and coupons
So that I can optimize my shopping and use my rewards
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
@Subject(ShoppingStoreService)
class ShoppingStoreServiceSpec extends BaseIntegrationTest {

    @Autowired
    ShoppingStoreService storeService

    @Autowired
    ShoppingStoreRepository storeRepository

    def "findAllStores should return paginated stores"() {
        given: "initial store count"
            def initialCount = storeRepository.count()
        and: "multiple new stores"
            (1..15).each {
                storeService.createStore(new ShoppingStoreDTO(name: "Store-${UUID.randomUUID()}"))
            }

        when: "fetching first page"
            def page = storeService.findAllStores(PageRequest.of(0, 10))

        then: "10 items are returned and total elements matches initial + new"
            page.content.size() == 10
            page.totalElements == initialCount + 15
    }

    def "createStore should save a new store"() {
        given: "a new store DTO"
            def dto = new ShoppingStoreDTO(name: "Store-${UUID.randomUUID()}", description: "Discount supermarket", icon: "L")

        when: "creating the store"
            def result = storeService.createStore(dto)

        then: "store is saved with an ID"
            result.id != null
            result.name == dto.name
            storeService.getStore(result.id).name == dto.name
    }

    def "updateStore should modify an existing store"() {
        given: "an existing store"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "Old Name-${UUID.randomUUID()}"))
            def updateDto = new ShoppingStoreDTO(name: "New Name-${UUID.randomUUID()}")

        when: "updating the store"
            def result = storeService.updateStore(store.id, updateDto)

        then: "store is updated"
            result.name == updateDto.name
            storeService.getStore(store.id).name == updateDto.name
    }

    def "deleteStore should remove store and throw exception on subsequent fetch"() {
        given: "an existing store"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "Deletable-${UUID.randomUUID()}"))

        when: "deleting the store"
            storeService.deleteStore(store.id)

        and: "trying to fetch it"
            storeService.getStore(store.id)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    // --- Loyalty Card Tests ---

    def "createLoyaltyCard should save card for existing store"() {
        given: "an existing store"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "CardStore-${UUID.randomUUID()}"))

        and: "a loyalty card DTO"
            def dto = new LoyaltyCardDTO(
                store: new StoreSummaryDTO(id: store.id, name: store.name),
                name: "Plus Card",
                barcode: new LoyaltyCardDTO.Barcode(code: "123456", type: "CODE_128")
            )

        when: "creating the card"
            def result = storeService.createLoyaltyCard(dto)

        then: "card is saved"
            result.id != null
            result.name == "Plus Card"
    }

    def "findLoyaltyCardsByStore should return cards for a store"() {
        given: "a store with a loyalty card"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "FindCardStore-${UUID.randomUUID()}"))
            storeService.createLoyaltyCard(new LoyaltyCardDTO(
                store: new StoreSummaryDTO(id: store.id, name: store.name),
                name: "Card1",
                barcode: new LoyaltyCardDTO.Barcode(code: "111", type: "QR")
            ))

        when: "finding cards by store"
            def result = storeService.findLoyaltyCardsByStore(store.id)

        then: "cards are returned"
            result.size() == 1
            result[0].name == "Card1"
    }

    def "deleteLoyaltyCard should throw ObjectNotFoundException for non-existent ID"() {
        when: "deleting a non-existent card"
            storeService.deleteLoyaltyCard(999999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    // --- Coupon Tests ---

    def "createCoupon should save coupon for existing store"() {
        given: "an existing store"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "CouponStore-${UUID.randomUUID()}"))

        and: "a coupon DTO"
            def dto = new CouponDTO(
                store: new StoreSummaryDTO(id: store.id, name: store.name),
                name: "10% off",
                barcode: new CouponDTO.Barcode(code: "C123", type: "CODE_128"),
                dueDate: LocalDate.now().plusDays(3)
            )

        when: "creating the coupon"
            def result = storeService.createCoupon(dto)

        then: "coupon is saved"
            result.id != null
            result.name == "10% off"
    }

    def "updateCoupon should update existing coupon"() {
        given: "an existing coupon"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "UpdCouponStore-${UUID.randomUUID()}"))
            def coupon = storeService.createCoupon(new CouponDTO(
                store: new StoreSummaryDTO(id: store.id, name: store.name),
                name: "Old",
                barcode: new CouponDTO.Barcode(code: "OLD", type: "CODE_128")
            ))

        when: "updating the coupon"
            def result = storeService.updateCoupon(coupon.id, new CouponDTO(
                name: "New",
                barcode: new CouponDTO.Barcode(code: "NEW_CODE", type: "QR"),
                used: true
            ))

        then: "coupon is updated"
            result.name == "New"
            result.barcode.code == "NEW_CODE"
            result.barcode.type == "QR"
            result.used
    }

    def "deleteCoupon should throw ObjectNotFoundException for non-existent ID"() {
        when: "deleting a non-existent coupon"
            storeService.deleteCoupon(999999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "findExpiringCoupons should return unused coupons expiring within 4 days"() {
        given: "a store with coupons at various dates"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "ExpStore-${UUID.randomUUID()}"))
            storeService.createCoupon(new CouponDTO(store: new StoreSummaryDTO(id: store.id, name: store.name), name: "Expiring soon", barcode: new CouponDTO.Barcode(code: "E1", type: "CODE_128"), dueDate: LocalDate.now().plusDays(2)))
            storeService.createCoupon(new CouponDTO(store: new StoreSummaryDTO(id: store.id, name: store.name), name: "Far away", barcode: new CouponDTO.Barcode(code: "F1", type: "CODE_128"), dueDate: LocalDate.now().plusDays(30)))
            storeService.createCoupon(new CouponDTO(store: new StoreSummaryDTO(id: store.id, name: store.name), name: "Already used", barcode: new CouponDTO.Barcode(code: "U1", type: "CODE_128"), dueDate: LocalDate.now().plusDays(1), used: true))

        when: "finding expiring coupons"
            def result = storeService.findExpiringCoupons()

        then: "only the unused soon-expiring coupon is returned"
            result.any { it.name == "Expiring soon" }
            result.every { !it.used }
    }
}
