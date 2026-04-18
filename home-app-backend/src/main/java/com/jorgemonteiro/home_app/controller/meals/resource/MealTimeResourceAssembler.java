package com.jorgemonteiro.home_app.controller.meals.resource;

import com.jorgemonteiro.home_app.controller.meals.MealTimeController;
import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class MealTimeResourceAssembler extends RepresentationModelAssemblerSupport<MealTimeDTO, MealTimeResource> {

    public MealTimeResourceAssembler() {
        super(MealTimeController.class, MealTimeResource.class);
    }

    @Override
    public MealTimeResource toModel(MealTimeDTO dto) {
        MealTimeResource resource = new MealTimeResource(dto);
        resource.add(linkTo(methodOn(MealTimeController.class).getById(dto.getId())).withSelfRel());
        resource.add(linkTo(methodOn(MealTimeController.class).listAll()).withRel("mealTimes"));
        return resource;
    }
}
