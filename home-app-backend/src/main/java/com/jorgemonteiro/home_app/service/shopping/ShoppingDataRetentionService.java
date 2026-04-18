package com.jorgemonteiro.home_app.service.shopping;

import com.jorgemonteiro.home_app.repository.shopping.ShoppingListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;

/**
 * Handles automated data maintenance tasks for the shopping module.
 */
@Service
@RequiredArgsConstructor
@Validated
@Slf4j
public class ShoppingDataRetentionService {

    private final ShoppingListRepository listRepository;

    /**
     * Deletes shopping lists older than 3 months, running daily at 02:00.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void purgeOldLists() {
        LocalDateTime threshold = LocalDateTime.now().minusMonths(3);
        int deleted = listRepository.deleteByCreatedAtBefore(threshold);
        if (deleted > 0) {
            log.info("Purged {} shopping lists older than 3 months", deleted);
        }
    }
}