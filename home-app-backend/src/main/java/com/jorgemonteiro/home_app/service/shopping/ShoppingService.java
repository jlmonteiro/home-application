package com.jorgemonteiro.home_app.service.shopping;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import com.jorgemonteiro.home_app.model.adapter.shopping.ShoppingAdapter;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingCategory;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingCategoryRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

/**
 * Service for managing shopping master data (Categories and Items).
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class ShoppingService {

    private final ShoppingCategoryRepository categoryRepository;
    private final ShoppingItemRepository itemRepository;

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
}
