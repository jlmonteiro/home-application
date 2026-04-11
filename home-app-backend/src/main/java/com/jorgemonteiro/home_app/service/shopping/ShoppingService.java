package com.jorgemonteiro.home_app.service.shopping;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import com.jorgemonteiro.home_app.model.adapter.shopping.ShoppingAdapter;
import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO;
import com.jorgemonteiro.home_app.model.entities.shopping.Coupon;
import com.jorgemonteiro.home_app.model.entities.shopping.LoyaltyCard;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingCategory;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingStore;
import com.jorgemonteiro.home_app.repository.shopping.CouponRepository;
import com.jorgemonteiro.home_app.repository.shopping.LoyaltyCardRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingCategoryRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingStoreRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing shopping master data (Categories, Items, Stores, Cards, Coupons).
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class ShoppingService {

    private final ShoppingCategoryRepository categoryRepository;
    private final ShoppingItemRepository itemRepository;
    private final ShoppingStoreRepository storeRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final CouponRepository couponRepository;

    // --- Category Methods ---

    @Transactional(readOnly = true)
    public Page<ShoppingCategoryDTO> findAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(ShoppingAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public ShoppingCategoryDTO getCategory(Long id) {
        return categoryRepository.findById(id)
                .map(ShoppingAdapter::toDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Category not found with ID: " + id));
    }

    public ShoppingCategoryDTO createCategory(@Valid ShoppingCategoryDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new ValidationException("Category name already exists: " + dto.getName());
        }
        ShoppingCategory entity = ShoppingAdapter.toEntity(dto);
        return ShoppingAdapter.toDTO(categoryRepository.save(entity));
    }

    public ShoppingCategoryDTO updateCategory(Long id, @Valid ShoppingCategoryDTO dto) {
        ShoppingCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Category not found with ID: " + id));

        if (!existing.getName().equals(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new ValidationException("Category name already exists: " + dto.getName());
        }

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setIcon(dto.getIcon());

        return ShoppingAdapter.toDTO(categoryRepository.save(existing));
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ObjectNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

    // --- Item Methods ---

    @Transactional(readOnly = true)
    public Page<ShoppingItemDTO> findAllItems(Pageable pageable) {
        return itemRepository.findAll(pageable).map(ShoppingAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ShoppingItemDTO> findItemsByCategory(Long categoryId, Pageable pageable) {
        return itemRepository.findByCategoryId(categoryId, pageable).map(ShoppingAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public ShoppingItemDTO getItem(Long id) {
        return itemRepository.findById(id)
                .map(ShoppingAdapter::toDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Item not found with ID: " + id));
    }

    public ShoppingItemDTO createItem(@Valid ShoppingItemDTO dto) {
        ShoppingCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ObjectNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        if (itemRepository.existsByNameAndCategoryId(dto.getName(), dto.getCategoryId())) {
            throw new ValidationException("Item already exists in this category: " + dto.getName());
        }

        ShoppingItem entity = ShoppingAdapter.toEntity(dto);
        category.addItem(entity);
        return ShoppingAdapter.toDTO(itemRepository.save(entity));
    }

    public ShoppingItemDTO updateItem(Long id, @Valid ShoppingItemDTO dto) {
        ShoppingItem existing = itemRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Item not found with ID: " + id));

        ShoppingCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ObjectNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        if ((!existing.getName().equals(dto.getName()) || !existing.getCategory().getId().equals(dto.getCategoryId()))
                && itemRepository.existsByNameAndCategoryId(dto.getName(), dto.getCategoryId())) {
            throw new ValidationException("Item already exists in this category: " + dto.getName());
        }

        existing.setName(dto.getName());
        existing.setPhoto(dto.getPhoto());
        existing.setCategory(category);

        return ShoppingAdapter.toDTO(itemRepository.save(existing));
    }

    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ObjectNotFoundException("Item not found with ID: " + id);
        }
        itemRepository.deleteById(id);
    }

    // --- Store Methods ---

    @Transactional(readOnly = true)
    public Page<ShoppingStoreDTO> findAllStores(Pageable pageable) {
        return storeRepository.findAll(pageable).map(ShoppingAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public ShoppingStoreDTO getStore(Long id) {
        return storeRepository.findById(id)
                .map(ShoppingAdapter::toDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + id));
    }

    public ShoppingStoreDTO createStore(@Valid ShoppingStoreDTO dto) {
        if (storeRepository.existsByName(dto.getName())) {
            throw new ValidationException("Store name already exists: " + dto.getName());
        }
        ShoppingStore entity = ShoppingAdapter.toEntity(dto);
        return ShoppingAdapter.toDTO(storeRepository.save(entity));
    }

    public ShoppingStoreDTO updateStore(Long id, @Valid ShoppingStoreDTO dto) {
        ShoppingStore existing = storeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + id));

        if (!existing.getName().equals(dto.getName()) && storeRepository.existsByName(dto.getName())) {
            throw new ValidationException("Store name already exists: " + dto.getName());
        }

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setIcon(dto.getIcon());
        existing.setPhoto(dto.getPhoto());

        return ShoppingAdapter.toDTO(storeRepository.save(existing));
    }

    public void deleteStore(Long id) {
        if (!storeRepository.existsById(id)) {
            throw new ObjectNotFoundException("Store not found with ID: " + id);
        }
        storeRepository.deleteById(id);
    }

    // --- LoyaltyCard Methods ---

    @Transactional(readOnly = true)
    public List<LoyaltyCardDTO> findLoyaltyCardsByStore(Long storeId) {
        return loyaltyCardRepository.findByStoreId(storeId).stream()
                .map(ShoppingAdapter::toDTO)
                .collect(Collectors.toList());
    }

    public LoyaltyCardDTO createLoyaltyCard(@Valid LoyaltyCardDTO dto) {
        ShoppingStore store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + dto.getStoreId()));

        LoyaltyCard entity = ShoppingAdapter.toEntity(dto);
        store.addLoyaltyCard(entity);
        return ShoppingAdapter.toDTO(loyaltyCardRepository.save(entity));
    }

    public void deleteLoyaltyCard(Long id) {
        if (!loyaltyCardRepository.existsById(id)) {
            throw new ObjectNotFoundException("Loyalty card not found with ID: " + id);
        }
        loyaltyCardRepository.deleteById(id);
    }

    // --- Coupon Methods ---

    @Transactional(readOnly = true)
    public Page<CouponDTO> findCouponsByStore(Long storeId, Pageable pageable) {
        return couponRepository.findByStoreId(storeId, pageable).map(ShoppingAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public List<CouponDTO> findExpiringCoupons() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(4);
        return couponRepository.findByUsedFalseAndDueDateBetweenOrderByDueDateAsc(now, threshold).stream()
                .map(ShoppingAdapter::toDTO)
                .collect(Collectors.toList());
    }

    public CouponDTO createCoupon(@Valid CouponDTO dto) {
        ShoppingStore store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + dto.getStoreId()));

        Coupon entity = ShoppingAdapter.toEntity(dto);
        store.addCoupon(entity);
        return ShoppingAdapter.toDTO(couponRepository.save(entity));
    }

    public CouponDTO updateCoupon(Long id, @Valid CouponDTO dto) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Coupon not found with ID: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setValue(dto.getValue());
        existing.setPhoto(dto.getPhoto());
        existing.setDueDate(dto.getDueDate());
        existing.setUsed(dto.isUsed());

        return ShoppingAdapter.toDTO(couponRepository.save(existing));
    }

    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ObjectNotFoundException("Coupon not found with ID: " + id);
        }
        couponRepository.deleteById(id);
    }
}
