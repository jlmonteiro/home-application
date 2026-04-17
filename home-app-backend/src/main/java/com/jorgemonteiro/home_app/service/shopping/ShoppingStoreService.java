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
import com.jorgemonteiro.home_app.service.media.PhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Manages shopping stores and their associated assets (loyalty cards, coupons).
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class ShoppingStoreService {

    private final ShoppingStoreRepository storeRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final CouponRepository couponRepository;
    private final ShoppingAdapter shoppingAdapter;
    private final PhotoService photoService;

    // --- Stores ---

    @Transactional(readOnly = true)
    public Page<ShoppingStoreDTO> findAllStores(Pageable pageable) {
        return storeRepository.findAll(pageable).map(shoppingAdapter::toStoreDTO);
    }

    @Transactional(readOnly = true)
    public ShoppingStoreDTO getStore(Long id) {
        return shoppingAdapter.toStoreDTO(requireStore(id));
    }

    public ShoppingStoreDTO createStore(@Valid ShoppingStoreDTO dto) {
        assertStoreNameUnique(dto.getName());
        ShoppingStore entity = shoppingAdapter.toStoreEntity(dto);
        
        if (dto.getPhoto() != null && dto.getPhoto().startsWith("data:image")) {
            String fileName = "store-" + UUID.randomUUID();
            entity.setPhoto(photoService.savePhoto(dto.getPhoto(), fileName, "store"));
        }

        return shoppingAdapter.toStoreDTO(storeRepository.save(entity));
    }

    public ShoppingStoreDTO updateStore(Long id, @Valid ShoppingStoreDTO dto) {
        ShoppingStore existing = requireStore(id);
        if (!existing.getName().equals(dto.getName())) {
            assertStoreNameUnique(dto.getName());
        }
        
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setIcon(dto.getIcon());
        
        if (dto.getPhoto() != null && dto.getPhoto().startsWith("data:image")) {
            String fileName = "store-" + UUID.randomUUID();
            existing.setPhoto(photoService.savePhoto(dto.getPhoto(), fileName, "store"));
        } else if (dto.getPhoto() == null) {
            existing.setPhoto(null);
        }

        return shoppingAdapter.toStoreDTO(storeRepository.save(existing));
    }

    public void deleteStore(Long id) {
        requireStore(id);
        storeRepository.deleteById(id);
    }

    // --- Loyalty Cards ---

    @Transactional(readOnly = true)
    public List<LoyaltyCardDTO> findLoyaltyCardsByStore(Long storeId) {
        requireStore(storeId);
        return loyaltyCardRepository.findAllByStoreIdOrderByCreatedAtDesc(storeId)
                .stream()
                .map(shoppingAdapter::toLoyaltyCardDTO)
                .toList();
    }

    public LoyaltyCardDTO createLoyaltyCard(@Valid LoyaltyCardDTO dto) {
        Long storeId = dto.getStore().getId();
        ShoppingStore store = requireStore(storeId);
        LoyaltyCard entity = shoppingAdapter.toLoyaltyCardEntity(dto, store);
        store.addLoyaltyCard(entity);
        return shoppingAdapter.toLoyaltyCardDTO(loyaltyCardRepository.save(entity));
    }

    public void deleteLoyaltyCard(Long cardId) {
        if (!loyaltyCardRepository.existsById(cardId)) {
            throw new ObjectNotFoundException("Loyalty card not found with ID: " + cardId);
        }
        loyaltyCardRepository.deleteById(cardId);
    }

    // --- Coupons ---

    @Transactional(readOnly = true)
    public Page<CouponDTO> findCouponsByStore(Long storeId, Pageable pageable) {
        requireStore(storeId);
        return couponRepository.findAllByStoreId(storeId, pageable)
                .map(shoppingAdapter::toCouponDTO);
    }

    @Transactional(readOnly = true)
    public List<CouponDTO> findExpiringCoupons() {
        return couponRepository.findAllByUsedFalseAndDueDateAfterOrderByDueDateAsc(LocalDateTime.now())
                .stream()
                .map(shoppingAdapter::toCouponDTO)
                .toList();
    }

    public CouponDTO createCoupon(@Valid CouponDTO dto) {
        Long storeId = dto.getStore().getId();
        ShoppingStore store = requireStore(storeId);
        Coupon entity = shoppingAdapter.toCouponEntity(dto, store);
        
        if (dto.getPhoto() != null && dto.getPhoto().startsWith("data:image")) {
            String fileName = "coupon-" + UUID.randomUUID();
            entity.setPhoto(photoService.savePhoto(dto.getPhoto(), fileName, "coupon"));
        }
        
        store.addCoupon(entity);
        return shoppingAdapter.toCouponDTO(couponRepository.save(entity));
    }

    public CouponDTO updateCoupon(Long id, @Valid CouponDTO dto) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Coupon not found with ID: " + id));
        
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setValue(dto.getValue());
        if (dto.getDueDate() != null) {
            existing.setDueDate(dto.getDueDate().atStartOfDay());
        }
        existing.setUsed(dto.isUsed());
        
        if (dto.getPhoto() != null && dto.getPhoto().startsWith("data:image")) {
            String fileName = "coupon-" + UUID.randomUUID();
            existing.setPhoto(photoService.savePhoto(dto.getPhoto(), fileName, "coupon"));
        } else if (dto.getPhoto() == null) {
            existing.setPhoto(null);
        }

        return shoppingAdapter.toCouponDTO(couponRepository.save(existing));
    }

    public void deleteCoupon(Long couponId) {
        if (!couponRepository.existsById(couponId)) {
            throw new ObjectNotFoundException("Coupon not found with ID: " + couponId);
        }
        couponRepository.deleteById(couponId);
    }

    // --- Private helpers ---

    private ShoppingStore requireStore(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + id));
    }

    private void assertStoreNameUnique(String name) {
        if (storeRepository.existsByName(name)) {
            throw new ValidationException("Store name already exists: " + name);
        }
    }
}
