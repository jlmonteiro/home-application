package com.jorgemonteiro.home_app.controller.shopping;

import com.jorgemonteiro.home_app.controller.shopping.resource.category.ShoppingCategoryResource;
import com.jorgemonteiro.home_app.controller.shopping.resource.category.ShoppingCategoryResourceAssembler;
import com.jorgemonteiro.home_app.controller.shopping.resource.item.ShoppingItemResource;
import com.jorgemonteiro.home_app.controller.shopping.resource.item.ShoppingItemResourceAssembler;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemPriceHistoryDTO;
import com.jorgemonteiro.home_app.service.shopping.ShoppingCatalogService;
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

import java.util.List;

/**
 * REST controller for managing shopping master data (Categories and Items).
 */
@RestController
@RequestMapping("/api/shopping")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingCatalogService catalogService;

    private final ShoppingCategoryResourceAssembler categoryAssembler;
    private final PagedResourcesAssembler<ShoppingCategoryDTO> pagedCategoryAssembler;

    private final ShoppingItemResourceAssembler itemAssembler;
    private final PagedResourcesAssembler<ShoppingItemDTO> pagedItemAssembler;

    // --- Categories ---

    @GetMapping("/categories")
    public ResponseEntity<PagedModel<ShoppingCategoryResource>> listCategories(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<ShoppingCategoryDTO> page = catalogService.findAllCategories(pageable);
        PagedModel<ShoppingCategoryResource> pagedModel = pagedCategoryAssembler.toModel(page, categoryAssembler);
        return ResponseEntity.ok(pagedModel);
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ShoppingCategoryResource> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryAssembler.toModel(catalogService.getCategory(id)));
    }

    @PostMapping("/categories")
    public ResponseEntity<ShoppingCategoryResource> createCategory(@RequestBody @Valid ShoppingCategoryDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryAssembler.toModel(catalogService.createCategory(dto)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ShoppingCategoryResource> updateCategory(
            @PathVariable Long id, @RequestBody @Valid ShoppingCategoryDTO dto) {
        return ResponseEntity.ok(categoryAssembler.toModel(catalogService.updateCategory(id, dto)));
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        catalogService.deleteCategory(id);
    }

    // --- Items ---

    @GetMapping("/items")
    public ResponseEntity<PagedModel<ShoppingItemResource>> listItems(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<ShoppingItemDTO> page = catalogService.findAllItems(search, pageable);
        PagedModel<ShoppingItemResource> pagedModel = pagedItemAssembler.toModel(page, itemAssembler);
        return ResponseEntity.ok(pagedModel);
    }

    @GetMapping("/categories/{id}/items")
    public ResponseEntity<PagedModel<ShoppingItemResource>> listItemsByCategory(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<ShoppingItemDTO> page = catalogService.findItemsByCategory(id, pageable);
        PagedModel<ShoppingItemResource> pagedModel = pagedItemAssembler.toModel(page, itemAssembler);
        return ResponseEntity.ok(pagedModel);
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<ShoppingItemResource> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemAssembler.toModel(catalogService.getItem(id)));
    }

    @PostMapping("/items")
    public ResponseEntity<ShoppingItemResource> createItem(@RequestBody @Valid ShoppingItemDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemAssembler.toModel(catalogService.createItem(dto)));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ShoppingItemResource> updateItem(
            @PathVariable Long id, @RequestBody @Valid ShoppingItemDTO dto) {
        return ResponseEntity.ok(itemAssembler.toModel(catalogService.updateItem(id, dto)));
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        catalogService.deleteItem(id);
    }

    @GetMapping("/items/{id}/price-history")
    public ResponseEntity<List<ShoppingItemPriceHistoryDTO>> getPriceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getItemPriceHistory(id));
    }
}
