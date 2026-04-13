package com.jorgemonteiro.home_app.service.shopping

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.exception.ValidationException
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO
import com.jorgemonteiro.home_app.repository.shopping.CouponRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingStoreRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.PageRequest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Title

import java.time.LocalDate

@Title("ShoppingStoreService")
@Narrative("""
As a household member
I want to manage stores, loyalty cards, and coupons
So that I can track where I shop and my available discounts
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShoppingStoreServiceSpec extends BaseIntegrationTest {

    @Autowired
    ShoppingStoreService storeService

    @Autowired
    ShoppingStoreRepository storeRepository

    @Autowired
    CouponRepository couponRepository

    // --- Store Tests ---

    def "createStore should save a new store successfully"() {
        given: "a new store DTO"
            def dto = new ShoppingStoreDTO(name: "UniqueStore-${UUID.randomUUID()}", description: "Discount supermarket")

        when: "creating the store"
            def result = storeService.createStore(dto)

        then: "store is saved with an ID"
            result.id != null
            result.description == "Discount supermarket"
    }

    def "createStore should throw ValidationException when name already exists"() {
        given: "an existing store"
            def name = "DupStore-${UUID.randomUUID()}"
            storeService.createStore(new ShoppingStoreDTO(name: name))

        when: "creating a duplicate"
            storeService.createStore(new ShoppingStoreDTO(name: name))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "getStore should return store when it exists"() {
        given: "an existing store"
            def created = storeService.createStore(new ShoppingStoreDTO(name: "GetStore-${UUID.randomUUID()}"))

        when: "getting by ID"
            def result = storeService.getStore(created.id)

        then: "correct store is returned"
            result.id == created.id
    }

    def "getStore should throw ObjectNotFoundException for non-existent ID"() {
        when: "getting a non-existent store"
            storeService.getStore(999999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "updateStore should update existing store"() {
        given: "an existing store"
            def created = storeService.createStore(new ShoppingStoreDTO(name: "UpdStore-${UUID.randomUUID()}"))
            def newName = "UpdStore-New-${UUID.randomUUID()}"

        when: "updating the store"
            def result = storeService.updateStore(created.id, new ShoppingStoreDTO(name: newName, description: "Updated"))

        then: "store is updated"
            result.name == newName
            result.description == "Updated"
    }

    def "updateStore should reject duplicate name"() {
        given: "two existing stores"
            def name1 = "Store1-${UUID.randomUUID()}"
            def name2 = "Store2-${UUID.randomUUID()}"
            storeService.createStore(new ShoppingStoreDTO(name: name1))
            def second = storeService.createStore(new ShoppingStoreDTO(name: name2))

        when: "renaming second to first's name"
            storeService.updateStore(second.id, new ShoppingStoreDTO(name: name1))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "deleteStore should remove store"() {
        given: "an existing store"
            def created = storeService.createStore(new ShoppingStoreDTO(name: "DelStore-${UUID.randomUUID()}"))

        when: "deleting the store"
            storeService.deleteStore(created.id)

        then: "store no longer exists"
            !storeRepository.existsById(created.id)
    }

    def "findAllStores should return paginated results"() {
        when: "finding all stores"
            def result = storeService.findAllStores(PageRequest.of(0, 100))

        then: "paginated results are returned"
            result.totalElements >= 1
    }

    // --- Loyalty Card Tests ---

    def "createLoyaltyCard should save card for existing store"() {
        given: "an existing store"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "CardStore-${UUID.randomUUID()}"))

        and: "a loyalty card DTO"
            def dto = new LoyaltyCardDTO(storeId: store.id, name: "Plus Card", number: "123456", barcodeType: "CODE_128")

        when: "creating the card"
            def result = storeService.createLoyaltyCard(dto)

        then: "card is saved"
            result.id != null
            result.name == "Plus Card"
    }

    def "findLoyaltyCardsByStore should return cards for a store"() {
        given: "a store with a loyalty card"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "FindCardStore-${UUID.randomUUID()}"))
            storeService.createLoyaltyCard(new LoyaltyCardDTO(storeId: store.id, name: "Card1", number: "111", barcodeType: "QR"))

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
            def dto = new CouponDTO(storeId: store.id, name: "10% off", barcodeType: "CODE_128", dueDate: LocalDate.now().plusDays(3))

        when: "creating the coupon"
            def result = storeService.createCoupon(dto)

        then: "coupon is saved"
            result.id != null
            result.name == "10% off"
    }

    def "updateCoupon should update existing coupon"() {
        given: "an existing coupon"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "UpdCouponStore-${UUID.randomUUID()}"))
            def coupon = storeService.createCoupon(new CouponDTO(storeId: store.id, name: "Old", barcodeType: "CODE_128"))

        when: "updating the coupon"
            def result = storeService.updateCoupon(coupon.id, new CouponDTO(name: "New", barcodeType: "QR", used: true))

        then: "coupon is updated"
            result.name == "New"
            result.barcodeType == "QR"
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
            storeService.createCoupon(new CouponDTO(storeId: store.id, name: "Expiring soon", barcodeType: "CODE_128", dueDate: LocalDate.now().plusDays(2)))
            storeService.createCoupon(new CouponDTO(storeId: store.id, name: "Far away", barcodeType: "CODE_128", dueDate: LocalDate.now().plusDays(30)))
            storeService.createCoupon(new CouponDTO(storeId: store.id, name: "Already used", barcodeType: "CODE_128", dueDate: LocalDate.now().plusDays(1), used: true))

        when: "finding expiring coupons"
            def result = storeService.findExpiringCoupons()

        then: "only the unused soon-expiring coupon is returned"
            result.any { it.name == "Expiring soon" }
            result.every { !it.used }
    }
}
