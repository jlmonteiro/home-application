package com.jorgemonteiro.home_app.service.shopping;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import com.jorgemonteiro.home_app.model.adapter.shopping.ShoppingAdapter;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemPriceHistoryDTO;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingCategory;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingCategoryRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemPriceHistoryRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.UUID;

/**
 * Manages shopping catalogue master data: categories, items, and item price history.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class ShoppingCatalogService {

    private final ShoppingCategoryRepository categoryRepository;
    private final ShoppingItemRepository itemRepository;
    private final ShoppingItemPriceHistoryRepository priceHistoryRepository;
    private final ShoppingAdapter shoppingAdapter;
    private final PhotoService photoService;

    // --- Categories ---

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
        assertCategoryNameUnique(dto.getName());
        return shoppingAdapter.toCategoryDTO(
                categoryRepository.save(shoppingAdapter.toCategoryEntity(dto)));
    }

    public ShoppingCategoryDTO updateCategory(Long id, @Valid ShoppingCategoryDTO dto) {
        ShoppingCategory existing = requireCategory(id);
        if (!existing.getName().equals(dto.getName())) {
            assertCategoryNameUnique(dto.getName());
        }
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setIcon(dto.getIcon());
        return shoppingAdapter.toCategoryDTO(categoryRepository.save(existing));
    }

    public void deleteCategory(Long id) {
        requireCategory(id);
        categoryRepository.deleteById(id);
    }

    // --- Items ---

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
        ShoppingCategory category = requireCategory(dto.getCategory().getId());
        assertItemNameUniqueInCategory(dto.getName(), dto.getCategory().getId());
        
        ShoppingItem entity = shoppingAdapter.toItemEntity(dto);
        
        // Handle photo saving to central storage
        if (dto.getPhoto() != null && dto.getPhoto().getData() != null && dto.getPhoto().getData().startsWith("data:image")) {
            String fileName = photoService.generateFileName(dto.getName(), "item");
            entity.setPhoto(photoService.savePhoto(dto.getPhoto().getData(), fileName, "item"));
        }
        
        category.addItem(entity);
        return shoppingAdapter.toItemDTO(itemRepository.save(entity));
    }

    public ShoppingItemDTO updateItem(Long id, @Valid ShoppingItemDTO dto) {
        ShoppingItem existing = requireItem(id);
        ShoppingCategory category = requireCategory(dto.getCategory().getId());
        
        boolean nameOrCategoryChanged = !existing.getName().equals(dto.getName())
                || !existing.getCategory().getId().equals(dto.getCategory().getId());
        if (nameOrCategoryChanged) {
            assertItemNameUniqueInCategory(dto.getName(), dto.getCategory().getId());
        }
        
        existing.setName(dto.getName());
        existing.setCategory(category);
        
        // Handle photo update/saving to central storage
        if (dto.getPhoto() != null && dto.getPhoto().getData() != null && dto.getPhoto().getData().startsWith("data:image")) {
            String fileName = photoService.generateFileName(dto.getName(), "item");
            existing.setPhoto(photoService.savePhoto(dto.getPhoto().getData(), fileName, "item"));
        } else if (dto.getPhoto() != null && dto.getPhoto().getData() == null) {
            existing.setPhoto(null);
        } else if (dto.getPhoto() != null && !dto.getPhoto().getData().startsWith("/api/images/")) {
            // If it's a URL or another name, keep it (though usually it's base64 from UI)
            existing.setPhoto(dto.getPhoto().getData());
        }

        return shoppingAdapter.toItemDTO(itemRepository.save(existing));
    }

    public void deleteItem(Long id) {
        requireItem(id);
        itemRepository.deleteById(id);
    }

    // --- Price History ---

    @Transactional(readOnly = true)
    public List<ShoppingItemPriceHistoryDTO> getItemPriceHistory(Long itemId) {
        requireItem(itemId);
        return priceHistoryRepository.findAllByItemIdOrderByRecordedAtDesc(itemId)
                .stream()
                .map(shoppingAdapter::toPriceHistoryDTO)
                .toList();
    }

    // --- Private helpers ---

    private ShoppingCategory requireCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Category not found with ID: " + id));
    }

    private ShoppingItem requireItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Item not found with ID: " + id));
    }

    private void assertCategoryNameUnique(String name) {
        if (categoryRepository.existsByName(name)) {
            throw new ValidationException("Category name already exists: " + name);
        }
    }

    private void assertItemNameUniqueInCategory(String name, Long categoryId) {
        if (itemRepository.existsByNameAndCategoryId(name, categoryId)) {
            throw new ValidationException("Item already exists in this category: " + name);
        }
    }
}
