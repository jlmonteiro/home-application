package com.jorgemonteiro.home_app.service.shopping;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import com.jorgemonteiro.home_app.model.adapter.shopping.ShoppingAdapter;
import com.jorgemonteiro.home_app.model.dtos.shopping.*;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.shopping.*;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.shopping.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing shopping master data (Categories, Items, Stores, Cards, Coupons, Lists).
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
    private final ShoppingListRepository listRepository;
    private final ShoppingListItemRepository listItemRepository;
    private final UserRepository userRepository;

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
        existing.setCode(dto.getCode());
        existing.setBarcodeType(dto.getBarcodeType());
        existing.setUsed(dto.isUsed());

        return ShoppingAdapter.toDTO(couponRepository.save(existing));
    }

    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ObjectNotFoundException("Coupon not found with ID: " + id);
        }
        couponRepository.deleteById(id);
    }

    // --- Shopping List Methods ---

    @Transactional(readOnly = true)
    public List<ShoppingListDTO> findAllLists() {
        return listRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ShoppingAdapter::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShoppingListDTO getList(Long id) {
        return listRepository.findById(id)
                .map(ShoppingAdapter::toDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Shopping list not found with ID: " + id));
    }

    public ShoppingListDTO createList(@Valid ShoppingListDTO dto, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ObjectNotFoundException("User not found: " + userEmail));
        
        ShoppingList entity = ShoppingAdapter.toEntity(dto);
        entity.setCreatedBy(creator);
        
        return ShoppingAdapter.toDTO(listRepository.save(entity));
    }

    public ShoppingListDTO updateList(Long id, @Valid ShoppingListDTO dto) {
        ShoppingList existing = listRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Shopping list not found with ID: " + id));

        if (dto.getName() != null) existing.setName(dto.getName());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
            if ("COMPLETED".equals(dto.getStatus()) && existing.getCompletedAt() == null) {
                existing.setCompletedAt(LocalDateTime.now());
            }
        }

        return ShoppingAdapter.toDTO(listRepository.save(existing));
    }
    public void deleteList(Long id) {
        if (!listRepository.existsById(id)) {
            throw new ObjectNotFoundException("Shopping list not found with ID: " + id);
        }
        listRepository.deleteById(id);
    }

    // --- Shopping List Item Methods ---

    public ShoppingListItemDTO addItemToList(Long listId, @Valid ShoppingListItemDTO dto) {
        ShoppingList list = listRepository.findById(listId)
                .orElseThrow(() -> new ObjectNotFoundException("Shopping list not found with ID: " + listId));
        
        ShoppingItem item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new ObjectNotFoundException("Item not found with ID: " + dto.getItemId()));
        
        ShoppingListItem entity = ShoppingAdapter.toEntity(dto);
        entity.setItem(item);

        if (dto.getStoreId() != null) {
            ShoppingStore store = storeRepository.findById(dto.getStoreId())
                    .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + dto.getStoreId()));
            entity.setStore(store);
        }

        list.addItem(entity);
        
        return ShoppingAdapter.toDTO(listItemRepository.save(entity));
    }

    public ShoppingListItemDTO updateListItem(Long itemId, @Valid ShoppingListItemDTO dto) {
        ShoppingListItem existing = listItemRepository.findById(itemId)
                .orElseThrow(() -> new ObjectNotFoundException("List item not found with ID: " + itemId));
        
        existing.setQuantity(dto.getQuantity());
        existing.setUnit(dto.getUnit());
        existing.setPrice(dto.getPrice());
        existing.setBought(dto.isBought());

        if (dto.getStoreId() != null) {
            ShoppingStore store = storeRepository.findById(dto.getStoreId())
                    .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + dto.getStoreId()));
            existing.setStore(store);
        } else {
            existing.setStore(null);
        }
        
        return ShoppingAdapter.toDTO(listItemRepository.save(existing));
    }

    public void removeListItem(Long itemId) {
        if (!listItemRepository.existsById(itemId)) {
            throw new ObjectNotFoundException("List item not found with ID: " + itemId);
        }
        listItemRepository.deleteById(itemId);
    }

    // --- Price Suggestion Logic ---

    @Transactional(readOnly = true)
    public BigDecimal suggestPrice(Long itemId, Long storeId) {
        if (storeId != null) {
            return listItemRepository.findLastPriceAtStore(itemId, storeId)
                    .map(ShoppingListItem::getPrice)
                    .orElseGet(() -> listItemRepository.findGlobalLastPrice(itemId)
                            .map(ShoppingListItem::getPrice)
                            .orElse(null));
        }
        return listItemRepository.findGlobalLastPrice(itemId)
                .map(ShoppingListItem::getPrice)
                .orElse(null);
    }
}
