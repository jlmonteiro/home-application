package com.jorgemonteiro.home_app.model.adapter.shopping;

import com.jorgemonteiro.home_app.model.dtos.shopping.*;
import com.jorgemonteiro.home_app.model.entities.shopping.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
/**
 * Adapter for converting between shopping entities and DTOs.
 * Pure data transformer — no I/O or repository calls.
 */
@Component
@RequiredArgsConstructor
public class ShoppingAdapter {

    /**
     * Converts a {@link ShoppingCategory} entity to a {@link ShoppingCategoryDTO}.
     * @param entity the category entity
     * @return the category DTO
     */
    public ShoppingCategoryDTO toCategoryDTO(ShoppingCategory entity) {
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
    public ShoppingCategory toCategoryEntity(ShoppingCategoryDTO dto) {
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
    public ShoppingItemDTO toItemDTO(ShoppingItem entity) {
        if (entity == null) return null;
        ShoppingItemDTO dto = new ShoppingItemDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPhoto(entity.getPhoto());
        dto.setVersion(entity.getVersion());
        if (entity.getCategory() != null) {
            dto.setCategory(new ShoppingItemDTO.Category(
                entity.getCategory().getId(),
                entity.getCategory().getName(),
                entity.getCategory().getIcon()
            ));
        }
        return dto;
    }

    /**
     * Converts a {@link ShoppingItemDTO} to a {@link ShoppingItem} entity.
     * Note: The category must be set manually after conversion.
     * @param dto the item DTO
     * @return the item entity
     */
    public ShoppingItem toItemEntity(ShoppingItemDTO dto) {
        if (dto == null) return null;
        ShoppingItem entity = new ShoppingItem();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPhoto(dto.getPhoto());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Store Methods ---

    public ShoppingStoreDTO toStoreDTO(ShoppingStore entity) {
        if (entity == null) return null;
        ShoppingStoreDTO dto = new ShoppingStoreDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setIcon(entity.getIcon());
        dto.setPhoto(entity.getPhoto());
        dto.setVersion(entity.getVersion());

        if (entity.getCoupons() != null) {
            LocalDateTime now = LocalDateTime.now();
            long count = entity.getCoupons().stream()
                    .filter(c -> !c.isUsed() && (c.getDueDate() == null || c.getDueDate().isAfter(now)))
                    .count();
            dto.setValidCouponsCount((int) count);
        } else {
            dto.setValidCouponsCount(0);
        }

        return dto;
    }

    public ShoppingStore toStoreEntity(ShoppingStoreDTO dto) {
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

    public LoyaltyCardDTO toLoyaltyCardDTO(LoyaltyCard entity) {
        if (entity == null) return null;
        LoyaltyCardDTO dto = new LoyaltyCardDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setVersion(entity.getVersion());
        if (entity.getStore() != null) {
            dto.setStore(new LoyaltyCardDTO.Store(
                entity.getStore().getId(),
                entity.getStore().getName()
            ));
        }
        if (entity.getNumber() != null && entity.getBarcodeType() != null) {
            dto.setBarcode(new LoyaltyCardDTO.Barcode(
                entity.getNumber(),
                entity.getBarcodeType()
            ));
        }
        return dto;
    }

    public LoyaltyCard toLoyaltyCardEntity(LoyaltyCardDTO dto) {
        if (dto == null) return null;
        LoyaltyCard entity = new LoyaltyCard();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        if (dto.getBarcode() != null) {
            entity.setNumber(dto.getBarcode().getCode());
            entity.setBarcodeType(dto.getBarcode().getType());
        }
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Coupon Methods ---

    public CouponDTO toCouponDTO(Coupon entity) {
        if (entity == null) return null;
        CouponDTO dto = new CouponDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setValue(entity.getValue());
        dto.setPhoto(entity.getPhoto());
        dto.setDueDate(entity.getDueDate() != null ? entity.getDueDate().toLocalDate() : null);
        dto.setUsed(entity.isUsed());
        dto.setVersion(entity.getVersion());
        if (entity.getStore() != null) {
            dto.setStore(new CouponDTO.Store(
                entity.getStore().getId(),
                entity.getStore().getName()
            ));
        }
        if (entity.getCode() != null && entity.getBarcodeType() != null) {
            dto.setBarcode(new CouponDTO.Barcode(
                entity.getCode(),
                entity.getBarcodeType()
            ));
        }
        return dto;
    }

    public Coupon toCouponEntity(CouponDTO dto) {
        if (dto == null) return null;
        Coupon entity = new Coupon();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setValue(dto.getValue());
        entity.setPhoto(dto.getPhoto());
        entity.setDueDate(dto.getDueDate() != null ? dto.getDueDate().atStartOfDay() : null);
        if (dto.getBarcode() != null) {
            entity.setCode(dto.getBarcode().getCode());
            entity.setBarcodeType(dto.getBarcode().getType());
        }
        entity.setUsed(dto.isUsed());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Shopping List Methods ---

    public ShoppingListDTO toListDTO(ShoppingList entity) {
        return toListDTO(entity, java.util.Collections.emptyMap());
    }

    /**
     * @param previousPrices map keyed by "itemId:storeId" (storeId may be "null") → previous price
     */
    public ShoppingListDTO toListDTO(ShoppingList entity, java.util.Map<String, BigDecimal> previousPrices) {
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
            dto.setItems(entity.getItems().stream().map(item -> {
                String key = item.getItem().getId() + ":" + (item.getStore() != null ? item.getStore().getId() : "null");
                return toListItemDTO(item, previousPrices.get(key));
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    public ShoppingList toListEntity(ShoppingListDTO dto) {
        if (dto == null) return null;
        ShoppingList entity = new ShoppingList();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : ShoppingListStatus.PENDING);
        entity.setVersion(dto.getVersion());
        return entity;
    }

    public ShoppingItemPriceHistoryDTO toPriceHistoryDTO(ShoppingItemPriceHistory entity) {
        if (entity == null) return null;
        ShoppingItemPriceHistoryDTO dto = new ShoppingItemPriceHistoryDTO();
        dto.setId(entity.getId());
        dto.setPrice(entity.getPrice());
        dto.setRecordedAt(entity.getRecordedAt());
        if (entity.getStore() != null) {
            dto.setStoreId(entity.getStore().getId());
            dto.setStoreName(entity.getStore().getName());
        }
        return dto;
    }

    public ShoppingListItemDTO toListItemDTO(ShoppingListItem entity) {
        return toListItemDTO(entity, null);
    }

    public ShoppingListItemDTO toListItemDTO(ShoppingListItem entity, BigDecimal previousPrice) {
        if (entity == null) return null;
        ShoppingListItemDTO dto = new ShoppingListItemDTO();
        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnit(entity.getUnit());
        dto.setPrice(entity.getPrice());
        dto.setBought(entity.isBought());
        dto.setUnavailable(entity.isUnavailable());
        dto.setVersion(entity.getVersion());
        dto.setPreviousPrice(previousPrice);

        if (entity.getItem() != null) {
            dto.setItemId(entity.getItem().getId());
            dto.setItemName(entity.getItem().getName());
            dto.setItemPhoto(entity.getItem().getPhoto());
            if (entity.getItem().getCategory() != null) {
                dto.setCategory(new ShoppingListItemDTO.Category(
                    entity.getItem().getCategory().getName(),
                    entity.getItem().getCategory().getIcon()
                ));
            }
        }

        if (entity.getStore() != null) {
            dto.setStore(new ShoppingListItemDTO.Store(
                entity.getStore().getId(),
                entity.getStore().getName()
            ));
        }

        return dto;
    }

    public ShoppingListItem toListItemEntity(ShoppingListItemDTO dto) {
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
