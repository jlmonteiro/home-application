package com.jorgemonteiro.home_app.controller.shopping;

import com.jorgemonteiro.home_app.controller.shopping.resource.list.ShoppingListItemResource;
import com.jorgemonteiro.home_app.controller.shopping.resource.list.ShoppingListItemResourceAssembler;
import com.jorgemonteiro.home_app.controller.shopping.resource.list.ShoppingListResource;
import com.jorgemonteiro.home_app.controller.shopping.resource.list.ShoppingListResourceAssembler;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListItemDTO;
import com.jorgemonteiro.home_app.service.shopping.ShoppingListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * REST controller for managing shopping lists and list items.
 */
@RestController
@RequestMapping("/api/shopping/lists")
@RequiredArgsConstructor
public class ShoppingListController {

    private final ShoppingListService listService;
    private final ShoppingListResourceAssembler listAssembler;
    private final ShoppingListItemResourceAssembler itemAssembler;

    @GetMapping
    public CollectionModel<ShoppingListResource> getAllLists() {
        return listAssembler.toCollectionModel(listService.findAllLists());
    }

    @GetMapping("/{id}")
    public ShoppingListResource getList(@PathVariable Long id) {
        return listAssembler.toModel(listService.getList(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListResource createList(
            @Valid @RequestBody ShoppingListDTO dto,
            @AuthenticationPrincipal OAuth2User principal) {
        return listAssembler.toModel(listService.createList(dto, principal.getAttribute("email")));
    }

    @PutMapping("/{id}")
    public ShoppingListResource updateList(@PathVariable Long id, @Valid @RequestBody ShoppingListDTO dto) {
        return listAssembler.toModel(listService.updateList(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        listService.deleteList(id);
        return ResponseEntity.noContent().build();
    }

    // --- List Items ---

    @PostMapping("/{id}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListItemResource addItemToList(
            @PathVariable Long id, @Valid @RequestBody ShoppingListItemDTO dto) {
        return itemAssembler.toModel(listService.addItemToList(id, dto));
    }

    @PatchMapping("/items/{itemId}")
    public ShoppingListItemResource updateListItem(
            @PathVariable Long itemId, @RequestBody ShoppingListItemDTO dto) {
        return itemAssembler.toModel(listService.updateListItem(itemId, dto));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeListItem(@PathVariable Long itemId) {
        listService.removeListItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // --- Price Suggestions ---

    @GetMapping("/suggest-price")
    public ResponseEntity<BigDecimal> suggestPrice(
            @RequestParam Long itemId,
            @RequestParam(required = false) Long storeId) {
        return ResponseEntity.ok(listService.suggestPrice(itemId, storeId));
    }
}
