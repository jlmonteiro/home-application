package com.jorgemonteiro.home_app.controller.meals.resource;

import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeDTO;
import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeScheduleDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.core.Relation;

import java.util.List;

@Getter
@Setter
@Relation(collectionRelation = "mealTimes", itemRelation = "mealTime")
public class MealTimeResource extends EntityModel<MealTimeDTO> {
    private Long id;
    private String name;
    private int sortOrder;
    private List<MealTimeScheduleDTO> schedules;
    private Long version;

    public MealTimeResource(MealTimeDTO dto) {
        this.id = dto.getId();
        this.name = dto.getName();
        this.sortOrder = dto.getSortOrder();
        this.schedules = dto.getSchedules();
        this.version = dto.getVersion();
    }
}
