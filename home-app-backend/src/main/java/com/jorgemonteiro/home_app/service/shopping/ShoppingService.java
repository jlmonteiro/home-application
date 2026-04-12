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
    private final ShoppingItemPriceHistoryRepository priceHistoryRepository;
    private final UserRepository userRepository;
    private final ShoppingAdapter shoppingAdapter;

    // --- Category Methods ---

    @Transactional(readOnly = true)
    public Page<ShoppingCategoryDTO> findAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(shoppingAdapter::toCategoryDTO);
    }

    @Transactional(readOnly = true)
    public ShoppingCategoryDTO getCategory(Long id) {
        return categoryRepository.findById(id)
                .map(shoppingAdapter::toCategoryDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Category not found with ID: " + id));
    }

    public ShoppingCategoryDTO createCategory(@Valid ShoppingCategoryDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new ValidationException("Category name already exists: " + dto.getName());
        }
        ShoppingCategory entity = shoppingAdapter.toCategoryEntity(dto);
        return shoppingAdapter.toCategoryDTO(categoryRepository.save(entity));
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

        return shoppingAdapter.toCategoryDTO(categoryRepository.save(existing));
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
        return itemRepository.findAll(pageable).map(shoppingAdapter::toItemDTO);
    }

    @Transactional(readOnly = true)
    public Page<ShoppingItemDTO> findItemsByCategory(Long categoryId, Pageable pageable) {
        return itemRepository.findByCategoryId(categoryId, pageable).map(shoppingAdapter::toItemDTO);
    }

    @Transactional(readOnly = true)
    public ShoppingItemDTO getItem(Long id) {
        return itemRepository.findById(id)
                .map(shoppingAdapter::toItemDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Item not found with ID: " + id));
    }

    public ShoppingItemDTO createItem(@Valid ShoppingItemDTO dto) {
        ShoppingCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ObjectNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        if (itemRepository.existsByNameAndCategoryId(dto.getName(), dto.getCategoryId())) {
            throw new ValidationException("Item already exists in this category: " + dto.getName());
        }

        ShoppingItem entity = shoppingAdapter.toItemEntity(dto);
        category.addItem(entity);
        return shoppingAdapter.toItemDTO(itemRepository.save(entity));
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

        return shoppingAdapter.toItemDTO(itemRepository.save(existing));
    }

    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ObjectNotFoundException("Item not found with ID: " + id);
        }
        itemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ShoppingItemPriceHistoryDTO> getItemPriceHistory(Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            throw new ObjectNotFoundException("Item not found with ID: " + itemId);
        }
        
        return priceHistoryRepository.findAllByItemIdOrderByRecordedAtDesc(itemId).stream()
                .map(shoppingAdapter::toPriceHistoryDTO)
                .collect(Collectors.toList());
    }

    // --- Store Methods ---

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
        if (storeRepository.existsByName(dto.getName())) {
            throw new ValidationException("Store name already exists: " + dto.getName());
        }
        ShoppingStore entity = shoppingAdapter.toStoreEntity(dto);
        return shoppingAdapter.toStoreDTO(storeRepository.save(entity));
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

        return shoppingAdapter.toStoreDTO(storeRepository.save(existing));
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
                .map(shoppingAdapter::toLoyaltyCardDTO)
                .collect(Collectors.toList());
    }

    public LoyaltyCardDTO createLoyaltyCard(@Valid LoyaltyCardDTO dto) {
        ShoppingStore store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + dto.getStoreId()));

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

    // --- Coupon Methods ---

    @Transactional(readOnly = true)
    public Page<CouponDTO> findCouponsByStore(Long storeId, Pageable pageable) {
        return couponRepository.findByStoreId(storeId, pageable).map(shoppingAdapter::toCouponDTO);
    }

    @Transactional(readOnly = true)
    public List<CouponDTO> findExpiringCoupons() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(4);
        return couponRepository.findByUsedFalseAndDueDateBetweenOrderByDueDateAsc(now, threshold).stream()
                .map(shoppingAdapter::toCouponDTO)
                .collect(Collectors.toList());
    }

    public CouponDTO createCoupon(@Valid CouponDTO dto) {
        ShoppingStore store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + dto.getStoreId()));

        Coupon entity = shoppingAdapter.toCouponEntity(dto);
        store.addCoupon(entity);
        return shoppingAdapter.toCouponDTO(couponRepository.save(entity));
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

        return shoppingAdapter.toCouponDTO(couponRepository.save(existing));
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
                .map(shoppingAdapter::toListDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShoppingListDTO getList(Long id) {
        return listRepository.findById(id)
                .map(shoppingAdapter::toListDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Shopping list not found with ID: " + id));
    }

    public ShoppingListDTO createList(@Valid ShoppingListDTO dto, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ObjectNotFoundException("User not found: " + userEmail));
        
        ShoppingList entity = shoppingAdapter.toListEntity(dto);
        entity.setCreatedBy(creator);
        
        return shoppingAdapter.toListDTO(listRepository.save(entity));
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

        return shoppingAdapter.toListDTO(listRepository.save(existing));
    }
    public void deleteList(Long id) {
        if (!listRepository.existsById(id)) {
            throw new ObjectNotFoundException("Shopping list not found with ID: " + id);
        }
        listRepository.deleteById(id);
    }

    // --- Shopping List Item Methods ---

    public ShoppingListItemDTO addItemToList(Long listId, ShoppingListItemDTO dto) {
        if (dto.getItemId() == null) throw new ValidationException("Item ID is required");
        if (dto.getQuantity() == null) throw new ValidationException("Quantity is required");

        ShoppingList list = listRepository.findById(listId)
                .orElseThrow(() -> new ObjectNotFoundException("Shopping list not found with ID: " + listId));
        
        ShoppingItem item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new ObjectNotFoundException("Item not found with ID: " + dto.getItemId()));
        
        ShoppingListItem entity = shoppingAdapter.toListItemEntity(dto);
        entity.setItem(item);

        if (dto.getStoreId() != null) {
            ShoppingStore store = storeRepository.findById(dto.getStoreId())
                    .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + dto.getStoreId()));
            entity.setStore(store);
        }

        list.addItem(entity);
        ShoppingListItem saved = listItemRepository.save(entity);

        if (dto.getPrice() != null) {
            recordPriceHistory(saved.getItem(), saved.getStore(), dto.getPrice());
        }
        
        return shoppingAdapter.toListItemDTO(saved);
    }

    public ShoppingListItemDTO updateListItem(Long itemId, ShoppingListItemDTO dto) {
        ShoppingListItem existing = listItemRepository.findById(itemId)
                .orElseThrow(() -> new ObjectNotFoundException("List item not found with ID: " + itemId));
        
        if (dto.getQuantity() != null) existing.setQuantity(dto.getQuantity());
        if (dto.getUnit() != null) existing.setUnit(dto.getUnit());
        if (dto.getPrice() != null) existing.setPrice(dto.getPrice());
        if (dto.getBought() != null) existing.setBought(dto.getBought());
        if (dto.getUnavailable() != null) existing.setUnavailable(dto.getUnavailable());

        if (dto.getStoreId() != null) {
            ShoppingStore store = storeRepository.findById(dto.getStoreId())
                    .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + dto.getStoreId()));
            existing.setStore(store);
        } else if (dto.getQuantity() != null || dto.getUnit() != null) {
            existing.setStore(null);
        }

        ShoppingListItem saved = listItemRepository.save(existing);

        if (dto.getPrice() != null) {
            recordPriceHistory(saved.getItem(), saved.getStore(), dto.getPrice());
        }
        
        return shoppingAdapter.toListItemDTO(saved);
    }

    private void recordPriceHistory(ShoppingItem item, ShoppingStore store, BigDecimal price) {
        if (price == null || item == null) return;

        priceHistoryRepository.findLatestPrice(item.getId(), store != null ? store.getId() : null)
                .ifPresentOrElse(
                        latest -> {
                            if (latest.getPrice().compareTo(price) != 0) {
                                priceHistoryRepository.save(new ShoppingItemPriceHistory(item, store, price));
                            }
                        },
                        () -> priceHistoryRepository.save(new ShoppingItemPriceHistory(item, store, price))
                );
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
        return priceHistoryRepository.findLatestPrice(itemId, storeId)
                .map(ShoppingItemPriceHistory::getPrice)
                .orElseGet(() -> {
                    if (storeId != null) {
                        return priceHistoryRepository.findLatestPrice(itemId, null)
                                .map(ShoppingItemPriceHistory::getPrice)
                                .orElse(null);
                    }
                    return null;
                });
    }
}
