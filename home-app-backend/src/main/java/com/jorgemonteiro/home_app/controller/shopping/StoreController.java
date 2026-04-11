package com.jorgemonteiro.home_app.controller.shopping;

import com.jorgemonteiro.home_app.controller.shopping.resource.*;
import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO;
import com.jorgemonteiro.home_app.service.shopping.ShoppingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing shopping stores, loyalty cards, and coupons.
 */
@RestController
@RequestMapping("/api/shopping")
@RequiredArgsConstructor
public class StoreController {

    private final ShoppingService shoppingService;

    private final ShoppingStoreResourceAssembler storeAssembler;
    private final PagedResourcesAssembler<ShoppingStoreDTO> pagedStoreAssembler;

    private final LoyaltyCardResourceAssembler cardAssembler;

    private final CouponResourceAssembler couponAssembler;
    private final PagedResourcesAssembler<CouponDTO> pagedCouponAssembler;

    // --- Store Endpoints ---

    @GetMapping("/stores")
    public ResponseEntity<PagedShoppingStoreResource> listStores(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<ShoppingStoreDTO> page = shoppingService.findAllStores(pageable);
        PagedModel<ShoppingStoreResource> pagedModel = pagedStoreAssembler.toModel(page, storeAssembler);
        
        return ResponseEntity.ok(new PagedShoppingStoreResource(
                pagedModel.getContent(), pagedModel.getMetadata(), pagedModel.getLinks()));
    }

    @GetMapping("/stores/{id}")
    public ResponseEntity<ShoppingStoreResource> getStore(@PathVariable Long id) {
        return ResponseEntity.ok(storeAssembler.toModel(shoppingService.getStore(id)));
    }

    @PostMapping("/stores")
    public ResponseEntity<ShoppingStoreResource> createStore(@RequestBody @Valid ShoppingStoreDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeAssembler.toModel(shoppingService.createStore(dto)));
    }

    @PutMapping("/stores/{id}")
    public ResponseEntity<ShoppingStoreResource> updateStore(
            @PathVariable Long id, @RequestBody @Valid ShoppingStoreDTO dto) {
        return ResponseEntity.ok(storeAssembler.toModel(shoppingService.updateStore(id, dto)));
    }

    @DeleteMapping("/stores/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        shoppingService.deleteStore(id);
        return ResponseEntity.noContent().build();
    }

    // --- LoyaltyCard Endpoints ---

    @GetMapping("/stores/{id}/loyalty-cards")
    public ResponseEntity<CollectionModel<LoyaltyCardResource>> listLoyaltyCards(@PathVariable Long id) {
        List<LoyaltyCardDTO> cards = shoppingService.findLoyaltyCardsByStore(id);
        return ResponseEntity.ok(cardAssembler.toCollectionModel(cards));
    }

    @PostMapping("/stores/{id}/loyalty-cards")
    public ResponseEntity<LoyaltyCardResource> createLoyaltyCard(
            @PathVariable Long id, @RequestBody @Valid LoyaltyCardDTO dto) {
        dto.setStoreId(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cardAssembler.toModel(shoppingService.createLoyaltyCard(dto)));
    }

    @DeleteMapping("/loyalty-cards/{id}")
    public ResponseEntity<Void> deleteLoyaltyCard(@PathVariable Long id) {
        shoppingService.deleteLoyaltyCard(id);
        return ResponseEntity.noContent().build();
    }

    // --- Coupon Endpoints ---

    @GetMapping("/stores/{id}/coupons")
    public ResponseEntity<PagedCouponResource> listCoupons(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "dueDate", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<CouponDTO> page = shoppingService.findCouponsByStore(id, pageable);
        PagedModel<CouponResource> pagedModel = pagedCouponAssembler.toModel(page, couponAssembler);
        
        return ResponseEntity.ok(new PagedCouponResource(
                pagedModel.getContent(), pagedModel.getMetadata(), pagedModel.getLinks()));
    }

    @GetMapping("/coupons/expiring")
    public ResponseEntity<CollectionModel<CouponResource>> listExpiringCoupons() {
        List<CouponDTO> coupons = shoppingService.findExpiringCoupons();
        return ResponseEntity.ok(couponAssembler.toCollectionModel(coupons));
    }

    @PostMapping("/stores/{id}/coupons")
    public ResponseEntity<CouponResource> createCoupon(
            @PathVariable Long id, @RequestBody @Valid CouponDTO dto) {
        dto.setStoreId(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponAssembler.toModel(shoppingService.createCoupon(dto)));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<CouponResource> updateCoupon(
            @PathVariable Long id, @RequestBody @Valid CouponDTO dto) {
        return ResponseEntity.ok(couponAssembler.toModel(shoppingService.updateCoupon(id, dto)));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        shoppingService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }
}
