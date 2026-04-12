package com.jorgemonteiro.home_app.model.adapter.shopping;

import com.jorgemonteiro.home_app.model.dtos.shopping.*;
import com.jorgemonteiro.home_app.model.entities.shopping.*;

import java.util.stream.Collectors;

/**
 * Adapter for converting between shopping entities and DTOs.
 */
public class ShoppingAdapter {

    private ShoppingAdapter() {
        // Private constructor to prevent instantiation
    }

    /**
     * Converts a {@link ShoppingCategory} entity to a {@link ShoppingCategoryDTO}.
     * @param entity the category entity
     * @return the category DTO
     */
    public static ShoppingCategoryDTO toDTO(ShoppingCategory entity) {
        if (entity == null) return null;
        ShoppingCategoryDTO dto = new ShoppingCategoryDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setIcon(entity.getIcon());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    /**
     * Converts a {@link ShoppingCategoryDTO} to a {@link ShoppingCategory} entity.
     * @param dto the category DTO
     * @return the category entity
     */
    public static ShoppingCategory toEntity(ShoppingCategoryDTO dto) {
        if (dto == null) return null;
        ShoppingCategory entity = new ShoppingCategory();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setIcon(dto.getIcon());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    /**
     * Converts a {@link ShoppingItem} entity to a {@link ShoppingItemDTO}.
     * @param entity the item entity
     * @return the item DTO
     */
    public static ShoppingItemDTO toDTO(ShoppingItem entity) {
        if (entity == null) return null;
        ShoppingItemDTO dto = new ShoppingItemDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPhoto(entity.getPhoto());
        dto.setVersion(entity.getVersion());
        if (entity.getCategory() != null) {
            dto.setCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }
        return dto;
    }

    /**
     * Converts a {@link ShoppingItemDTO} to a {@link ShoppingItem} entity.
     * Note: The category must be set manually after conversion.
     * @param dto the item DTO
     * @return the item entity
     */
    public static ShoppingItem toEntity(ShoppingItemDTO dto) {
        if (dto == null) return null;
        ShoppingItem entity = new ShoppingItem();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPhoto(dto.getPhoto());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Store Methods ---

    public static ShoppingStoreDTO toDTO(ShoppingStore entity) {
        if (entity == null) return null;
        ShoppingStoreDTO dto = new ShoppingStoreDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setIcon(entity.getIcon());
        dto.setPhoto(entity.getPhoto());
        dto.setVersion(entity.getVersion());

        if (entity.getCoupons() != null) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            long count = entity.getCoupons().stream()
                    .filter(c -> !c.isUsed() && (c.getDueDate() == null || c.getDueDate().isAfter(now)))
                    .count();
            dto.setValidCouponsCount((int) count);
        } else {
            dto.setValidCouponsCount(0);
        }

        return dto;
    }

    public static ShoppingStore toEntity(ShoppingStoreDTO dto) {
        if (dto == null) return null;
        ShoppingStore entity = new ShoppingStore();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setIcon(dto.getIcon());
        entity.setPhoto(dto.getPhoto());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- LoyaltyCard Methods ---

    public static LoyaltyCardDTO toDTO(LoyaltyCard entity) {
        if (entity == null) return null;
        LoyaltyCardDTO dto = new LoyaltyCardDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setNumber(entity.getNumber());
        dto.setBarcodeType(entity.getBarcodeType());
        dto.setVersion(entity.getVersion());
        if (entity.getStore() != null) {
            dto.setStoreId(entity.getStore().getId());
            dto.setStoreName(entity.getStore().getName());
        }
        return dto;
    }

    public static LoyaltyCard toEntity(LoyaltyCardDTO dto) {
        if (dto == null) return null;
        LoyaltyCard entity = new LoyaltyCard();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setNumber(dto.getNumber());
        entity.setBarcodeType(dto.getBarcodeType());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Coupon Methods ---

    public static CouponDTO toDTO(Coupon entity) {
        if (entity == null) return null;
        CouponDTO dto = new CouponDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setValue(entity.getValue());
        dto.setPhoto(entity.getPhoto());
        dto.setDueDate(entity.getDueDate());
        dto.setCode(entity.getCode());
        dto.setBarcodeType(entity.getBarcodeType());
        dto.setUsed(entity.isUsed());
        dto.setVersion(entity.getVersion());
        if (entity.getStore() != null) {
            dto.setStoreId(entity.getStore().getId());
            dto.setStoreName(entity.getStore().getName());
        }
        return dto;
    }

    public static Coupon toEntity(CouponDTO dto) {
        if (dto == null) return null;
        Coupon entity = new Coupon();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setValue(dto.getValue());
        entity.setPhoto(dto.getPhoto());
        entity.setDueDate(dto.getDueDate());
        entity.setCode(dto.getCode());
        entity.setBarcodeType(dto.getBarcodeType());
        entity.setUsed(dto.isUsed());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Shopping List Methods ---

    public static ShoppingListDTO toDTO(ShoppingList entity) {
        if (entity == null) return null;
        ShoppingListDTO dto = new ShoppingListDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setVersion(entity.getVersion());
        
        if (entity.getCreatedBy() != null) {
            dto.setCreatedBy(entity.getCreatedBy().getEmail());
            dto.setCreatorName(entity.getCreatedBy().getFirstName() + " " + entity.getCreatedBy().getLastName());
        }
        
        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream().map(ShoppingAdapter::toDTO).collect(Collectors.toList()));
        }
        
        return dto;
    }

    public static ShoppingList toEntity(ShoppingListDTO dto) {
        if (dto == null) return null;
        ShoppingList entity = new ShoppingList();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        entity.setVersion(dto.getVersion());
        return entity;
    }

    public static ShoppingListItemDTO toDTO(ShoppingListItem entity) {
        if (entity == null) return null;
        ShoppingListItemDTO dto = new ShoppingListItemDTO();
        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnit(entity.getUnit());
        dto.setPrice(entity.getPrice());
        dto.setBought(entity.isBought());
        dto.setUnavailable(entity.isUnavailable());
        dto.setVersion(entity.getVersion());
        
        if (entity.getItem() != null) {
            dto.setItemId(entity.getItem().getId());
            dto.setItemName(entity.getItem().getName());
            dto.setItemPhoto(entity.getItem().getPhoto());
            if (entity.getItem().getCategory() != null) {
                dto.setCategoryIcon(entity.getItem().getCategory().getIcon());
            }
        }

        if (entity.getStore() != null) {
            dto.setStoreId(entity.getStore().getId());
            dto.setStoreName(entity.getStore().getName());
        }
        
        return dto;
    }

    public static ShoppingListItem toEntity(ShoppingListItemDTO dto) {
        if (dto == null) return null;
        ShoppingListItem entity = new ShoppingListItem();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setUnit(dto.getUnit());
        entity.setPrice(dto.getPrice());
        entity.setBought(Boolean.TRUE.equals(dto.getBought()));
        entity.setUnavailable(Boolean.TRUE.equals(dto.getUnavailable()));
        entity.setVersion(dto.getVersion());
        return entity;
    }
}
