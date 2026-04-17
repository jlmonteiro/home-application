package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.NutrientDTO;
import com.jorgemonteiro.home_app.model.entities.recipes.Nutrient;
import com.jorgemonteiro.home_app.repository.recipes.NutrientRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings/nutrients")
@RequiredArgsConstructor
public class NutrientController {

    private final NutrientRepository nutrientRepository;
    private final RecipeAdapter recipeAdapter;

    @GetMapping
    public CollectionModel<NutrientDTO> listAll() {
        List<NutrientDTO> list = nutrientRepository.findAllByOrderByNameAsc().stream()
                .map(recipeAdapter::toNutrientDTO)
                .toList();
        return CollectionModel.of(list);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NutrientDTO create(@Valid @RequestBody NutrientDTO dto) {
        Nutrient entity = recipeAdapter.toNutrientEntity(dto);
        return recipeAdapter.toNutrientDTO(nutrientRepository.save(entity));
    }

    @PutMapping("/{id}")
    public NutrientDTO update(@PathVariable Long id, @Valid @RequestBody NutrientDTO dto) {
        Nutrient entity = nutrientRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Nutrient not found with id " + id));
        
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setUnit(dto.getUnit());
        
        return recipeAdapter.toNutrientDTO(nutrientRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!nutrientRepository.existsById(id)) {
            throw new ObjectNotFoundException("Nutrient not found with id " + id);
        }
        nutrientRepository.deleteById(id);
    }
}
