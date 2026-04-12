package com.jorgemonteiro.home_app.controller.shopping;

import com.jorgemonteiro.home_app.controller.shopping.resource.ShoppingListItemResource;
import com.jorgemonteiro.home_app.controller.shopping.resource.ShoppingListItemResourceAssembler;
import com.jorgemonteiro.home_app.controller.shopping.resource.ShoppingListResource;
import com.jorgemonteiro.home_app.controller.shopping.resource.ShoppingListResourceAssembler;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListItemDTO;
import com.jorgemonteiro.home_app.service.shopping.ShoppingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST controller for managing shopping lists and items.
 */
@RestController
@RequestMapping("/api/shopping/lists")
@RequiredArgsConstructor
public class ShoppingListController {

    private final ShoppingService shoppingService;
    private final ShoppingListResourceAssembler listAssembler;
    private final ShoppingListItemResourceAssembler itemAssembler;

    @GetMapping
    public CollectionModel<ShoppingListResource> getAllLists() {
        List<ShoppingListDTO> lists = shoppingService.findAllLists();
        return listAssembler.toCollectionModel(lists);
    }

    @GetMapping("/{id}")
    public ShoppingListResource getList(@PathVariable Long id) {
        ShoppingListDTO dto = shoppingService.getList(id);
        return listAssembler.toModel(dto);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListResource createList(@Valid @RequestBody ShoppingListDTO dto, @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        ShoppingListDTO created = shoppingService.createList(dto, email);
        return listAssembler.toModel(created);
    }

    @PutMapping("/{id}")
    public ShoppingListResource updateList(@PathVariable Long id, @Valid @RequestBody ShoppingListDTO dto) {
        ShoppingListDTO updated = shoppingService.updateList(id, dto);
        return listAssembler.toModel(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        shoppingService.deleteList(id);
        return ResponseEntity.noContent().build();
    }

    // --- Item Management ---

    @PostMapping("/{id}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListItemResource addItemToList(@PathVariable Long id, @Valid @RequestBody ShoppingListItemDTO dto) {
        ShoppingListItemDTO created = shoppingService.addItemToList(id, dto);
        return itemAssembler.toModel(created);
    }

    @PatchMapping("/items/{itemId}")
    public ShoppingListItemResource updateListItem(@PathVariable Long itemId, @RequestBody ShoppingListItemDTO dto) {
        ShoppingListItemDTO updated = shoppingService.updateListItem(itemId, dto);
        return itemAssembler.toModel(updated);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeListItem(@PathVariable Long itemId) {
        shoppingService.removeListItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // --- Suggestions ---

    @GetMapping("/suggest-price")
    public ResponseEntity<BigDecimal> suggestPrice(@RequestParam Long itemId, @RequestParam(required = false) Long storeId) {
        BigDecimal suggestion = shoppingService.suggestPrice(itemId, storeId);
        return ResponseEntity.ok(suggestion);
    }
}
