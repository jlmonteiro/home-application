package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.NutrientDTO;
import com.jorgemonteiro.home_app.service.recipes.NutrientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing global nutrient definitions.
 */
@RestController
@RequestMapping("/api/settings/nutrients")
@RequiredArgsConstructor
public class NutrientController {

    private final NutrientService nutrientService;
    private final RecipeAdapter recipeAdapter;

    @GetMapping
    public CollectionModel<NutrientDTO> listAll() {
        List<NutrientDTO> list = nutrientService.listAll().stream()
                .map(recipeAdapter::toNutrientDTO)
                .toList();
        return CollectionModel.of(list);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NutrientDTO create(@Valid @RequestBody NutrientDTO dto) {
        return recipeAdapter.toNutrientDTO(nutrientService.create(dto));
    }

    @PutMapping("/{id}")
    public NutrientDTO update(@PathVariable Long id, @Valid @RequestBody NutrientDTO dto) {
        return recipeAdapter.toNutrientDTO(nutrientService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        nutrientService.delete(id);
    }
}
