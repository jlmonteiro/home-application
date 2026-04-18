package com.jorgemonteiro.home_app.controller.meals;

import com.jorgemonteiro.home_app.controller.meals.resource.MealTimeResource;
import com.jorgemonteiro.home_app.controller.meals.resource.MealTimeResourceAssembler;
import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeDTO;
import com.jorgemonteiro.home_app.service.meals.MealTimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings/meal-times")
@RequiredArgsConstructor
public class MealTimeController {

    private final MealTimeService mealTimeService;
    private final MealTimeResourceAssembler resourceAssembler;

    @GetMapping
    public CollectionModel<MealTimeResource> listAll() {
        return resourceAssembler.toCollectionModel(mealTimeService.listAll());
    }

    @GetMapping("/{id}")
    public MealTimeResource getById(@PathVariable Long id) {
        return resourceAssembler.toModel(mealTimeService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealTimeResource create(@Valid @RequestBody MealTimeDTO dto) {
        return resourceAssembler.toModel(mealTimeService.create(dto));
    }

    @PutMapping("/{id}")
    public MealTimeResource update(@PathVariable Long id, @Valid @RequestBody MealTimeDTO dto) {
        return resourceAssembler.toModel(mealTimeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        mealTimeService.delete(id);
    }
}
