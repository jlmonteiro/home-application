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
            def dto = new ShoppingStoreDTO(name: "Lidl", description: "Discount supermarket")

        when: "creating the store"
            def result = storeService.createStore(dto)

        then: "store is saved with an ID"
            result.id != null
            result.name == "Lidl"
            result.description == "Discount supermarket"
    }

    def "createStore should throw ValidationException when name already exists"() {
        given: "an existing store"
            storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))

        when: "creating a duplicate"
            storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "getStore should return store when it exists"() {
        given: "an existing store"
            def created = storeService.createStore(new ShoppingStoreDTO(name: "Aldi"))

        when: "getting by ID"
            def result = storeService.getStore(created.id)

        then: "correct store is returned"
            result.name == "Aldi"
    }

    def "getStore should throw ObjectNotFoundException for non-existent ID"() {
        when: "getting a non-existent store"
            storeService.getStore(999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "updateStore should update existing store"() {
        given: "an existing store"
            def created = storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))

        when: "updating the store"
            def result = storeService.updateStore(created.id, new ShoppingStoreDTO(name: "Lidl Plus", description: "Updated"))

        then: "store is updated"
            result.name == "Lidl Plus"
            result.description == "Updated"
    }

    def "updateStore should reject duplicate name"() {
        given: "two existing stores"
            storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))
            def aldi = storeService.createStore(new ShoppingStoreDTO(name: "Aldi"))

        when: "renaming Aldi to Lidl"
            storeService.updateStore(aldi.id, new ShoppingStoreDTO(name: "Lidl"))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "deleteStore should remove store"() {
        given: "an existing store"
            def created = storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))

        when: "deleting the store"
            storeService.deleteStore(created.id)

        then: "store no longer exists"
            !storeRepository.existsById(created.id)
    }

    def "findAllStores should return paginated results"() {
        given: "multiple stores"
            storeService.createStore(new ShoppingStoreDTO(name: "A"))
            storeService.createStore(new ShoppingStoreDTO(name: "B"))

        when: "finding all stores"
            def result = storeService.findAllStores(PageRequest.of(0, 10))

        then: "paginated results are returned"
            result.totalElements >= 2
    }

    // --- Loyalty Card Tests ---

    def "createLoyaltyCard should save card for existing store"() {
        given: "an existing store"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))

        and: "a loyalty card DTO"
            def dto = new LoyaltyCardDTO(storeId: store.id, name: "Lidl Plus", number: "123456", barcodeType: "CODE_128")

        when: "creating the card"
            def result = storeService.createLoyaltyCard(dto)

        then: "card is saved"
            result.id != null
            result.name == "Lidl Plus"
            result.storeName == "Lidl"
    }

    def "findLoyaltyCardsByStore should return cards for a store"() {
        given: "a store with a loyalty card"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))
            storeService.createLoyaltyCard(new LoyaltyCardDTO(storeId: store.id, name: "Card1", number: "111", barcodeType: "QR"))

        when: "finding cards by store"
            def result = storeService.findLoyaltyCardsByStore(store.id)

        then: "cards are returned"
            result.size() == 1
            result[0].name == "Card1"
    }

    def "deleteLoyaltyCard should throw ObjectNotFoundException for non-existent ID"() {
        when: "deleting a non-existent card"
            storeService.deleteLoyaltyCard(999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    // --- Coupon Tests ---

    def "createCoupon should save coupon for existing store"() {
        given: "an existing store"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))

        and: "a coupon DTO"
            def dto = new CouponDTO(storeId: store.id, name: "10% off", barcodeType: "CODE_128", dueDate: LocalDate.now().plusDays(3))

        when: "creating the coupon"
            def result = storeService.createCoupon(dto)

        then: "coupon is saved"
            result.id != null
            result.name == "10% off"
            result.storeName == "Lidl"
    }

    def "updateCoupon should update existing coupon"() {
        given: "an existing coupon"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))
            def coupon = storeService.createCoupon(new CouponDTO(storeId: store.id, name: "Old", barcodeType: "CODE_128"))

        when: "updating the coupon"
            def result = storeService.updateCoupon(coupon.id, new CouponDTO(name: "New", barcodeType: "QR", used: true))

        then: "coupon is updated"
            result.name == "New"
            result.barcodeType == "QR"
            result.used == true
    }

    def "deleteCoupon should throw ObjectNotFoundException for non-existent ID"() {
        when: "deleting a non-existent coupon"
            storeService.deleteCoupon(999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "findExpiringCoupons should return unused coupons expiring within 4 days"() {
        given: "a store with coupons at various dates"
            def store = storeService.createStore(new ShoppingStoreDTO(name: "Lidl"))
            storeService.createCoupon(new CouponDTO(storeId: store.id, name: "Expiring soon", barcodeType: "CODE_128", dueDate: LocalDate.now().plusDays(2)))
            storeService.createCoupon(new CouponDTO(storeId: store.id, name: "Far away", barcodeType: "CODE_128", dueDate: LocalDate.now().plusDays(30)))
            storeService.createCoupon(new CouponDTO(storeId: store.id, name: "Already used", barcodeType: "CODE_128", dueDate: LocalDate.now().plusDays(1), used: true))

        when: "finding expiring coupons"
            def result = storeService.findExpiringCoupons()

        then: "only the unused soon-expiring coupon is returned"
            result.size() == 1
            result[0].name == "Expiring soon"
    }
}
