package com.jorgemonteiro.home_app.service.recipes;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.NutrientDTO;
import com.jorgemonteiro.home_app.model.entities.recipes.Nutrient;
import com.jorgemonteiro.home_app.repository.recipes.NutrientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Service for managing master nutrient definitions.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class NutrientService {

    private final NutrientRepository nutrientRepository;
    private final RecipeAdapter recipeAdapter;

    @Transactional(readOnly = true)
    public List<Nutrient> listAll() {
        return nutrientRepository.findAllByOrderByNameAsc();
    }

    public Nutrient create(NutrientDTO dto) {
        Nutrient entity = recipeAdapter.toNutrientEntity(dto);
        return nutrientRepository.save(entity);
    }

    public Nutrient update(Long id, NutrientDTO dto) {
        Nutrient entity = nutrientRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Nutrient not found with id " + id));
        
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setUnit(dto.getUnit());
        
        return nutrientRepository.save(entity);
    }

    public void delete(Long id) {
        if (!nutrientRepository.existsById(id)) {
            throw new ObjectNotFoundException("Nutrient not found with id " + id);
        }
        nutrientRepository.deleteById(id);
    }
}
