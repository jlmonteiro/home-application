package com.jorgemonteiro.home_app.service.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.Label;
import com.jorgemonteiro.home_app.repository.recipes.LabelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing recipe labels with auto-cleanup logic (ADR-4).
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LabelService {

    private final LabelRepository labelRepository;

    /**
     * Finds or creates labels by their names.
     * @param names a set of label names.
     * @return a set of persisted Label entities.
     */
    public Set<Label> getOrCreateLabels(Set<String> names) {
        if (names == null) return Set.of();
        
        return names.stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .map(name -> labelRepository.findByName(name)
                        .orElseGet(() -> {
                            log.debug("Creating new dynamic label: {}", name);
                            return labelRepository.save(new Label(name));
                        }))
                .collect(Collectors.toSet());
    }

    /**
     * Deletes labels that are no longer referenced by any recipe.
     */
    public void cleanupOrphanedLabels() {
        List<Label> orphaned = labelRepository.findOrphanedLabels();
        if (!orphaned.isEmpty()) {
            log.info("Cleaning up {} orphaned labels", orphaned.size());
            labelRepository.deleteAll(orphaned);
        }
    }

    /**
     * Searches for existing labels for autocomplete.
     * @param query the search query.
     * @return a list of matching labels.
     */
    @Transactional(readOnly = true)
    public List<Label> searchLabels(String query) {
        return labelRepository.searchByQuery(query);
    }
}
