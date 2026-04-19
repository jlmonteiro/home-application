package com.jorgemonteiro.home_app.model.adapter.shopping;

import com.jorgemonteiro.home_app.model.dtos.shared.*;
import com.jorgemonteiro.home_app.model.dtos.shopping.*;
import com.jorgemonteiro.home_app.model.entities.shopping.*;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Collections;

/**
 * Adapter class that converts between shopping entities and DTOs.
 */
@Component
@RequiredArgsConstructor
public class ShoppingAdapter {

    private final PhotoService photoService;

    // --- Categories ---

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

    public ShoppingCategory toCategoryEntity(ShoppingCategoryDTO dto) {
        if (dto == null) return null;
        ShoppingCategory entity = new ShoppingCategory();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setIcon(dto.getIcon());
        entity.setVersion(entity.getVersion());
        return entity;
    }

    // --- Items ---

    public ShoppingItemDTO toItemDTO(ShoppingItem entity) {
        if (entity == null) return null;
        ShoppingItemDTO dto = new ShoppingItemDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setUnit(entity.getUnit());
        dto.setPcQuantity(entity.getPcQuantity());
        dto.setPcUnit(entity.getPcUnit());
        dto.setNutritionSampleSize(entity.getNutritionSampleSize());
        dto.setNutritionSampleUnit(entity.getNutritionSampleUnit());
        dto.setPhoto(new PhotoDTO(null, photoService.getPhotoUrl(entity.getPhoto())));
        dto.setVersion(entity.getVersion());
        if (entity.getCategory() != null) {
            dto.setCategory(new CategorySummaryDTO(
                entity.getCategory().getId(),
                entity.getCategory().getName(),
                entity.getCategory().getIcon()
            ));
        }
        return dto;
    }

    public ShoppingItem toItemEntity(ShoppingItemDTO dto) {
        if (dto == null) return null;
        ShoppingItem entity = new ShoppingItem();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setUnit(dto.getUnit() != null ? dto.getUnit() : "pcs");
        entity.setPcQuantity(dto.getPcQuantity());
        entity.setPcUnit(dto.getPcUnit());
        
        if (dto.getNutritionSampleSize() != null) {
            entity.setNutritionSampleSize(dto.getNutritionSampleSize());
        }
        if (dto.getNutritionSampleUnit() != null) {
            entity.setNutritionSampleUnit(dto.getNutritionSampleUnit());
        }
        
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Stores ---

    public ShoppingStoreDTO toStoreDTO(ShoppingStore entity) {
        if (entity == null) return null;
        ShoppingStoreDTO dto = new ShoppingStoreDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setIcon(entity.getIcon());
        dto.setPhoto(new PhotoDTO(null, photoService.getPhotoUrl(entity.getPhoto())));
        dto.setVersion(entity.getVersion());
        return dto;
    }

    public ShoppingStore toStoreEntity(ShoppingStoreDTO dto) {
        if (dto == null) return null;
        ShoppingStore entity = new ShoppingStore();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setIcon(dto.getIcon());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Loyalty Cards ---

    public LoyaltyCardDTO toLoyaltyCardDTO(LoyaltyCard entity) {
        if (entity == null) return null;
        LoyaltyCardDTO dto = new LoyaltyCardDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setBarcode(new LoyaltyCardDTO.Barcode(entity.getNumber(), entity.getBarcodeType()));
        dto.setVersion(entity.getVersion());
        if (entity.getStore() != null) {
            dto.setStore(new StoreSummaryDTO(entity.getStore().getId(), entity.getStore().getName()));
        }
        return dto;
    }

    public LoyaltyCard toLoyaltyCardEntity(LoyaltyCardDTO dto, ShoppingStore store) {
        if (dto == null) return null;
        LoyaltyCard entity = new LoyaltyCard();
        entity.setId(dto.getId());
        entity.setStore(store);
        entity.setName(dto.getName());
        if (dto.getBarcode() != null) {
            entity.setNumber(dto.getBarcode().getCode());
            entity.setBarcodeType(dto.getBarcode().getType());
        }
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Coupons ---

    public CouponDTO toCouponDTO(Coupon entity) {
        if (entity == null) return null;
        CouponDTO dto = new CouponDTO();
        dto.setId(entity.getId());
        if (entity.getStore() != null) {
            dto.setStore(new StoreSummaryDTO(entity.getStore().getId(), entity.getStore().getName()));
        }
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setValue(entity.getValue());
        dto.setPhoto(new PhotoDTO(null, photoService.getPhotoUrl(entity.getPhoto())));
        dto.setDueDate(entity.getDueDate() != null ? entity.getDueDate().toLocalDate() : null);
        dto.setBarcode(new CouponDTO.Barcode(entity.getCode(), entity.getBarcodeType()));
        dto.setUsed(entity.isUsed());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    public Coupon toCouponEntity(CouponDTO dto, ShoppingStore store) {
        if (dto == null) return null;
        Coupon entity = new Coupon();
        entity.setId(dto.getId());
        entity.setStore(store);
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setValue(dto.getValue());
        if (dto.getDueDate() != null) {
            entity.setDueDate(dto.getDueDate().atStartOfDay());
        }
        if (dto.getBarcode() != null) {
            entity.setCode(dto.getBarcode().getCode());
            entity.setBarcodeType(dto.getBarcode().getType());
        }
        entity.setUsed(dto.isUsed());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Lists ---

    public ShoppingListDTO toListDTO(ShoppingList entity) {
        return toListDTO(entity, Collections.emptyMap());
    }

    public ShoppingListDTO toListDTO(ShoppingList entity, Map<String, BigDecimal> previousPriceMap) {
        if (entity == null) return null;
        ShoppingListDTO dto = new ShoppingListDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setCreatedBy(entity.getCreatedBy().getEmail());
        dto.setCreatorName(entity.getCreatedBy().getFirstName() + " " + entity.getCreatedBy().getLastName());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setVersion(entity.getVersion());
        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                .map(item -> toListItemDTO(item, previousPriceMap))
                .toList());
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

    // --- List Items ---

    public ShoppingListItemDTO toListItemDTO(ShoppingListItem entity) {
        return toListItemDTO(entity, Collections.emptyMap());
    }

    public ShoppingListItemDTO toListItemDTO(ShoppingListItem entity, Map<String, BigDecimal> previousPriceMap) {
        if (entity == null) return null;
        ShoppingListItemDTO dto = new ShoppingListItemDTO();
        dto.setId(entity.getId());
        
        CategorySummaryDTO category = null;
        if (entity.getItem().getCategory() != null) {
            category = new CategorySummaryDTO(
                entity.getItem().getCategory().getName(),
                entity.getItem().getCategory().getIcon()
            );
        }

        ItemSummaryDTO itemSummary = new ItemSummaryDTO(
            entity.getItem().getId(),
            entity.getItem().getName(),
            photoService.getPhotoUrl(entity.getItem().getPhoto()),
            entity.getItem().getUnit(),
            entity.getItem().getPcQuantity(),
            entity.getItem().getPcUnit()
        );
        itemSummary.setCategory(category);

        dto.setItem(itemSummary);
        dto.setUnit(entity.getUnit());
        
        if (entity.getStore() != null) {
            dto.setStore(new StoreSummaryDTO(
                entity.getStore().getId(),
                entity.getStore().getName(),
                photoService.getPhotoUrl(entity.getStore().getPhoto())
            ));
        }

        dto.setQuantity(entity.getQuantity());
        
        String key = entity.getItem().getId() + (entity.getStore() != null ? ":" + entity.getStore().getId() : "");
        dto.setPricing(new ShoppingListItemDTO.Pricing(
            entity.getPrice(),
            previousPriceMap.get(key)
        ));

        dto.setBought(entity.isBought());
        dto.setUnavailable(entity.isUnavailable());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    public ShoppingListItem toListItemEntity(ShoppingListItemDTO dto) {
        if (dto == null) return null;
        ShoppingListItem entity = new ShoppingListItem();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setUnit(dto.getUnit());
        
        if (dto.getPricing() != null) {
            entity.setPrice(dto.getPricing().getPrice());
        }
        
        entity.setBought(dto.getBought() != null ? dto.getBought() : false);
        entity.setUnavailable(dto.getUnavailable() != null ? dto.getUnavailable() : false);
        entity.setVersion(dto.getVersion());
        return entity;
    }

    // --- Price History ---

    public ShoppingItemPriceHistoryDTO toPriceHistoryDTO(ShoppingItemPriceHistory entity) {
        if (entity == null) return null;
        ShoppingItemPriceHistoryDTO dto = new ShoppingItemPriceHistoryDTO();
        dto.setId(entity.getId());
        if (entity.getStore() != null) {
            dto.setStore(new StoreSummaryDTO(
                    entity.getStore().getId(),
                    entity.getStore().getName()
            ));
        }
        dto.setPrice(entity.getPrice());
        dto.setRecordedAt(entity.getRecordedAt());
        return dto;
    }
}
