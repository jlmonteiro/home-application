package com.jorgemonteiro.home_app.controller.meals.resource;

import com.jorgemonteiro.home_app.controller.meals.MealPlanController;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class MealPlanResourceAssembler extends RepresentationModelAssemblerSupport<MealPlanDTO, MealPlanResource> {

    public MealPlanResourceAssembler() {
        super(MealPlanController.class, MealPlanResource.class);
    }

    @Override
    public MealPlanResource toModel(MealPlanDTO dto) {
        MealPlanResource resource = new MealPlanResource(dto);
        // We pass null for the date parameter in methodOn as it's just for link structure
        resource.add(linkTo(methodOn(MealPlanController.class).getPlan(null)).withSelfRel());
        return resource;
    }
}
