package com.jorgemonteiro.home_app.controller.shopping;

import com.jorgemonteiro.home_app.controller.shopping.resource.*;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import com.jorgemonteiro.home_app.service.shopping.ShoppingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing shopping master data (Categories and Items).
 */
@RestController
@RequestMapping("/api/shopping")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;
    
    private final ShoppingCategoryResourceAssembler categoryAssembler;
    private final PagedResourcesAssembler<ShoppingCategoryDTO> pagedCategoryAssembler;
    
    private final ShoppingItemResourceAssembler itemAssembler;
    private final PagedResourcesAssembler<ShoppingItemDTO> pagedItemAssembler;

    // --- Category Endpoints ---

    @GetMapping("/categories")
    public ResponseEntity<PagedShoppingCategoryResource> listCategories(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<ShoppingCategoryDTO> page = shoppingService.findAllCategories(pageable);
        PagedModel<ShoppingCategoryResource> pagedModel = pagedCategoryAssembler.toModel(page, categoryAssembler);
        
        return ResponseEntity.ok(new PagedShoppingCategoryResource(
                pagedModel.getContent(), pagedModel.getMetadata(), pagedModel.getLinks()));
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ShoppingCategoryResource> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryAssembler.toModel(shoppingService.getCategory(id)));
    }

    @PostMapping("/categories")
    public ResponseEntity<ShoppingCategoryResource> createCategory(@RequestBody @Valid ShoppingCategoryDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryAssembler.toModel(shoppingService.createCategory(dto)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ShoppingCategoryResource> updateCategory(
            @PathVariable Long id, @RequestBody @Valid ShoppingCategoryDTO dto) {
        return ResponseEntity.ok(categoryAssembler.toModel(shoppingService.updateCategory(id, dto)));
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        shoppingService.deleteCategory(id);
    }

    // --- Item Endpoints ---

    @GetMapping("/items")
    public ResponseEntity<PagedShoppingItemResource> listItems(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<ShoppingItemDTO> page = shoppingService.findAllItems(pageable);
        PagedModel<ShoppingItemResource> pagedModel = pagedItemAssembler.toModel(page, itemAssembler);
        
        return ResponseEntity.ok(new PagedShoppingItemResource(
                pagedModel.getContent(), pagedModel.getMetadata(), pagedModel.getLinks()));
    }

    @GetMapping("/categories/{id}/items")
    public ResponseEntity<PagedShoppingItemResource> listItemsByCategory(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<ShoppingItemDTO> page = shoppingService.findItemsByCategory(id, pageable);
        PagedModel<ShoppingItemResource> pagedModel = pagedItemAssembler.toModel(page, itemAssembler);
        
        return ResponseEntity.ok(new PagedShoppingItemResource(
                pagedModel.getContent(), pagedModel.getMetadata(), pagedModel.getLinks()));
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<ShoppingItemResource> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemAssembler.toModel(shoppingService.getItem(id)));
    }

    @PostMapping("/items")
    public ResponseEntity<ShoppingItemResource> createItem(@RequestBody @Valid ShoppingItemDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemAssembler.toModel(shoppingService.createItem(dto)));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ShoppingItemResource> updateItem(
            @PathVariable Long id, @RequestBody @Valid ShoppingItemDTO dto) {
        return ResponseEntity.ok(itemAssembler.toModel(shoppingService.updateItem(id, dto)));
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        shoppingService.deleteItem(id);
    }
}
