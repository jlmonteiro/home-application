package com.jorgemonteiro.home_app.service.shopping;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import com.jorgemonteiro.home_app.model.adapter.shopping.ShoppingAdapter;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListItemDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.shopping.*;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.shopping.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Optional.ofNullable;

/**
 * Manages shopping lists, list items, and price suggestions.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class ShoppingListService {

    private final ShoppingListRepository listRepository;
    private final ShoppingListItemRepository listItemRepository;
    private final ShoppingItemRepository itemRepository;
    private final ShoppingStoreRepository storeRepository;
    private final ShoppingItemPriceHistoryRepository priceHistoryRepository;
    private final UserRepository userRepository;
    private final ShoppingAdapter shoppingAdapter;

    // --- Lists ---

    @Transactional(readOnly = true)
    public List<ShoppingListDTO> findAllLists() {
        return listRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(list -> shoppingAdapter.toListDTO(list, buildPreviousPriceMap(list)))
                .toList();
    }

    @Transactional(readOnly = true)
    public ShoppingListDTO getList(Long id) {
        ShoppingList list = requireList(id);
        return shoppingAdapter.toListDTO(list, buildPreviousPriceMap(list));
    }

    public ShoppingListDTO createList(@Valid ShoppingListDTO dto, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ObjectNotFoundException("User not found: " + userEmail));
        ShoppingList entity = shoppingAdapter.toListEntity(dto);
        entity.setCreatedBy(creator);
        return shoppingAdapter.toListDTO(listRepository.save(entity));
    }

    public ShoppingListDTO updateList(Long id, @Valid ShoppingListDTO dto) {
        ShoppingList existing = requireList(id);
        ofNullable(dto.getName()).ifPresent(existing::setName);
        ofNullable(dto.getDescription()).ifPresent(existing::setDescription);
        ofNullable(dto.getStatus()).ifPresent(status -> applyStatusChange(existing, status));
        return shoppingAdapter.toListDTO(listRepository.save(existing));
    }

    public void deleteList(Long id) {
        requireList(id);
        listRepository.deleteById(id);
    }

    // --- List Items ---

    public ShoppingListItemDTO addItemToList(Long listId, ShoppingListItemDTO dto) {
        if (dto.getItemId() == null) throw new ValidationException("Item ID is required");
        if (dto.getQuantity() == null) throw new ValidationException("Quantity is required");

        ShoppingList list = requireList(listId);
        ShoppingItem item = requireItem(dto.getItemId());

        ShoppingListItem entity = shoppingAdapter.toListItemEntity(dto);
        entity.setItem(item);
        ofNullable(dto.getStore()).map(s -> s.getId()).map(this::requireStore).ifPresent(entity::setStore);

        list.addItem(entity);
        ShoppingListItem saved = listItemRepository.save(entity);

        ofNullable(dto.getPrice()).ifPresent(p -> recordPriceIfChanged(saved.getItem(), saved.getStore(), p));

        return shoppingAdapter.toListItemDTO(saved);
    }

    public ShoppingListItemDTO updateListItem(Long itemId, ShoppingListItemDTO dto) {
        ShoppingListItem existing = requireListItem(itemId);

        ofNullable(dto.getQuantity()).ifPresent(existing::setQuantity);
        ofNullable(dto.getPrice()).ifPresent(existing::setPrice);
        ofNullable(dto.getBought()).ifPresent(existing::setBought);
        ofNullable(dto.getUnavailable()).ifPresent(existing::setUnavailable);
        ofNullable(dto.getStore()).map(s -> s.getId()).map(this::requireStore).ifPresent(existing::setStore);

        ShoppingListItem saved = listItemRepository.save(existing);

        ofNullable(dto.getPrice()).ifPresent(p -> recordPriceIfChanged(saved.getItem(), saved.getStore(), p));

        return shoppingAdapter.toListItemDTO(saved);
    }

    public void removeListItem(Long itemId) {
        requireListItem(itemId);
        listItemRepository.deleteById(itemId);
    }

    // --- Price Suggestions ---

    @Transactional(readOnly = true)
    public BigDecimal suggestPrice(Long itemId, Long storeId) {
        return priceHistoryRepository.findLatestPrice(itemId, storeId)
                .map(ShoppingItemPriceHistory::getPrice)
                .orElseGet(() -> storeId != null
                        ? priceHistoryRepository.findLatestPrice(itemId, null)
                                .map(ShoppingItemPriceHistory::getPrice).orElse(null)
                        : null);
    }

    // --- Private helpers ---

    /**
     * Marks a list as COMPLETED (with timestamp) when the status transitions to COMPLETED.
     */
    private void applyStatusChange(ShoppingList list, ShoppingListStatus newStatus) {
        list.setStatus(newStatus);
        if (ShoppingListStatus.COMPLETED == newStatus && list.getCompletedAt() == null) {
            list.setCompletedAt(LocalDateTime.now());
        }
    }

    /**
     * Records a new price history entry only when the price differs from the latest recorded one.
     */
    private void recordPriceIfChanged(ShoppingItem item, ShoppingStore store, BigDecimal price) {
        if (item == null || price == null) return;
        Long storeId = store != null ? store.getId() : null;
        boolean isDifferent = priceHistoryRepository.findLatestPrice(item.getId(), storeId)
                .map(latest -> latest.getPrice().compareTo(price) != 0)
                .orElse(true);
        if (isDifferent) {
            priceHistoryRepository.save(new ShoppingItemPriceHistory(item, store, price));
        }
    }

    /**
     * Batch-fetches the two most recent price records for all items in the list and
     * builds a map keyed by "itemId:storeId" → previous price for display comparison.
     */
    private Map<String, BigDecimal> buildPreviousPriceMap(ShoppingList list) {
        if (list.getItems() == null || list.getItems().isEmpty()) return Map.of();

        List<Long> itemIds = list.getItems().stream()
                .filter(i -> i.getItem() != null)
                .map(i -> i.getItem().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<String, List<ShoppingItemPriceHistory>> grouped = priceHistoryRepository
                .findLatestTwoPricesForItems(itemIds)
                .stream()
                .collect(Collectors.groupingBy(h ->
                        h.getItem().getId() + ":" + (h.getStore() != null ? h.getStore().getId() : "null")));

        Map<String, BigDecimal> result = new HashMap<>();
        for (ShoppingListItem listItem : list.getItems()) {
            if (listItem.getItem() == null) continue;
            String key = listItem.getItem().getId() + ":" + (listItem.getStore() != null ? listItem.getStore().getId() : "null");
            List<ShoppingItemPriceHistory> records = grouped.getOrDefault(key, List.of());
            if (records.isEmpty()) continue;

            BigDecimal currentPrice = listItem.getPrice();
            ShoppingItemPriceHistory latest = records.get(0);

            if (currentPrice != null && records.size() >= 2 && latest.getPrice().compareTo(currentPrice) == 0) {
                result.put(key, records.get(1).getPrice());
            } else if (currentPrice == null || latest.getPrice().compareTo(currentPrice) != 0) {
                result.put(key, latest.getPrice());
            }
        }
        return result;
    }

    private ShoppingList requireList(Long id) {
        return listRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Shopping list not found with ID: " + id));
    }

    private ShoppingListItem requireListItem(Long id) {
        return listItemRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("List item not found with ID: " + id));
    }

    private ShoppingItem requireItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Item not found with ID: " + id));
    }

    private ShoppingStore requireStore(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Store not found with ID: " + id));
    }
}
