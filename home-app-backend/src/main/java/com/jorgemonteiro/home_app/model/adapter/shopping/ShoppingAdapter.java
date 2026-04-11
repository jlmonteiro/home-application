package com.jorgemonteiro.home_app.model.adapter.shopping;

import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO;
import com.jorgemonteiro.home_app.model.entities.shopping.Coupon;
import com.jorgemonteiro.home_app.model.entities.shopping.LoyaltyCard;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingCategory;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingStore;

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
        entity.setUsed(dto.isUsed());
        entity.setVersion(dto.getVersion());
        return entity;
    }
}
