package com.jorgemonteiro.home_app.service.shopping;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import com.jorgemonteiro.home_app.model.adapter.shopping.ShoppingAdapter;
import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO;
import com.jorgemonteiro.home_app.model.entities.shopping.Coupon;
import com.jorgemonteiro.home_app.model.entities.shopping.LoyaltyCard;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingStore;
import com.jorgemonteiro.home_app.repository.shopping.CouponRepository;
import com.jorgemonteiro.home_app.repository.shopping.LoyaltyCardRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingStoreRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static java.util.Optional.ofNullable;

/**
 * Manages stores, loyalty cards, and coupons.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class ShoppingStoreService {

    private final ShoppingStoreRepository storeRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final CouponRepository couponRepository;
    private final ShoppingAdapter shoppingAdapter;

    // --- Stores ---

    @Transactional(readOnly = true)
    public Page<ShoppingStoreDTO> findAllStores(Pageable pageable) {
        return storeRepository.findAll(pageable).map(shoppingAdapter::toStoreDTO);
    }

    @Transactional(readOnly = true)
    public ShoppingStoreDTO getStore(Long id) {
        return storeRepository.findById(id)
                .map(shoppingAdapter::toStoreDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + id));
    }

    public ShoppingStoreDTO createStore(@Valid ShoppingStoreDTO dto) {
        assertStoreNameUnique(dto.getName());
        return shoppingAdapter.toStoreDTO(
                storeRepository.save(shoppingAdapter.toStoreEntity(dto)));
    }

    public ShoppingStoreDTO updateStore(Long id, @Valid ShoppingStoreDTO dto) {
        ShoppingStore existing = requireStore(id);
        if (!existing.getName().equals(dto.getName())) {
            assertStoreNameUnique(dto.getName());
        }
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setIcon(dto.getIcon());
        existing.setPhoto(dto.getPhoto());
        return shoppingAdapter.toStoreDTO(storeRepository.save(existing));
    }

    public void deleteStore(Long id) {
        requireStore(id);
        storeRepository.deleteById(id);
    }

    // --- Loyalty Cards ---

    @Transactional(readOnly = true)
    public List<LoyaltyCardDTO> findLoyaltyCardsByStore(Long storeId) {
        return loyaltyCardRepository.findByStoreId(storeId)
                .stream()
                .map(shoppingAdapter::toLoyaltyCardDTO)
                .toList();
    }

    public LoyaltyCardDTO createLoyaltyCard(@Valid LoyaltyCardDTO dto) {
        ShoppingStore store = requireStore(dto.getStore().getId());
        LoyaltyCard entity = shoppingAdapter.toLoyaltyCardEntity(dto);
        store.addLoyaltyCard(entity);
        return shoppingAdapter.toLoyaltyCardDTO(loyaltyCardRepository.save(entity));
    }

    public void deleteLoyaltyCard(Long id) {
        if (!loyaltyCardRepository.existsById(id)) {
            throw new ObjectNotFoundException("Loyalty card not found with ID: " + id);
        }
        loyaltyCardRepository.deleteById(id);
    }

    // --- Coupons ---

    @Transactional(readOnly = true)
    public Page<CouponDTO> findCouponsByStore(Long storeId, Pageable pageable) {
        return couponRepository.findByStoreId(storeId, pageable).map(shoppingAdapter::toCouponDTO);
    }

    @Transactional(readOnly = true)
    public List<CouponDTO> findExpiringCoupons() {
        LocalDateTime now = LocalDateTime.now();
        return couponRepository.findByUsedFalseAndDueDateBetweenOrderByDueDateAsc(now, now.plusDays(4))
                .stream()
                .map(shoppingAdapter::toCouponDTO)
                .toList();
    }

    public CouponDTO createCoupon(@Valid CouponDTO dto) {
        ShoppingStore store = requireStore(dto.getStore().getId());
        Coupon entity = shoppingAdapter.toCouponEntity(dto);
        store.addCoupon(entity);
        return shoppingAdapter.toCouponDTO(couponRepository.save(entity));
    }

    public CouponDTO updateCoupon(Long id, @Valid CouponDTO dto) {
        Coupon existing = requireCoupon(id);
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setValue(dto.getValue());
        existing.setPhoto(dto.getPhoto());
        existing.setDueDate(ofNullable(dto.getDueDate()).map(LocalDate::atStartOfDay).orElse(null));
        if (dto.getBarcode() != null) {
            existing.setCode(dto.getBarcode().getCode());
            existing.setBarcodeType(dto.getBarcode().getType());
        }
        existing.setUsed(dto.isUsed());
        return shoppingAdapter.toCouponDTO(couponRepository.save(existing));
    }

    public void deleteCoupon(Long id) {
        requireCoupon(id);
        couponRepository.deleteById(id);
    }

    // --- Private helpers ---

    ShoppingStore requireStore(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + id));
    }

    private Coupon requireCoupon(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Coupon not found with ID: " + id));
    }

    private void assertStoreNameUnique(String name) {
        if (storeRepository.existsByName(name)) {
            throw new ValidationException("Store name already exists: " + name);
        }
    }
}
