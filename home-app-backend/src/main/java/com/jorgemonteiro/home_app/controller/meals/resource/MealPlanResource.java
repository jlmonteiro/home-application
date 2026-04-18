package com.jorgemonteiro.home_app.controller.meals.resource;

import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanDTO;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanEntryDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Relation(collectionRelation = "mealPlans", itemRelation = "mealPlan")
public class MealPlanResource extends EntityModel<MealPlanDTO> {
    private Long id;
    private LocalDate weekStartDate;
    private String status;
    private List<MealPlanEntryDTO> entries;
    private Long version;

    public MealPlanResource(MealPlanDTO dto) {
        this.id = dto.getId();
        this.weekStartDate = dto.getWeekStartDate();
        this.status = dto.getStatus();
        this.entries = dto.getEntries();
        this.version = dto.getVersion();
    }
}
