package com.jorgemonteiro.home_app.controller.meals;

import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeDTO;
import com.jorgemonteiro.home_app.service.meals.MealTimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for configuring meal times.
 */
@RestController
@RequestMapping("/api/settings/meal-times")
@RequiredArgsConstructor
public class MealTimeController {

    private final MealTimeService mealTimeService;

    @GetMapping
    public List<MealTimeDTO> listAll() {
        return mealTimeService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealTimeDTO create(@Valid @RequestBody MealTimeDTO dto) {
        return mealTimeService.create(dto);
    }

    @PutMapping("/{id}")
    public MealTimeDTO update(@PathVariable Long id, @Valid @RequestBody MealTimeDTO dto) {
        return mealTimeService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        mealTimeService.delete(id);
    }
}
