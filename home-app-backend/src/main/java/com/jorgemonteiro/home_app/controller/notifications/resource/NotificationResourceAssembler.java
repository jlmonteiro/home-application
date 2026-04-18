package com.jorgemonteiro.home_app.controller.notifications.resource;

import com.jorgemonteiro.home_app.controller.notifications.NotificationController;
import com.jorgemonteiro.home_app.model.dtos.notifications.NotificationDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class NotificationResourceAssembler extends RepresentationModelAssemblerSupport<NotificationDTO, NotificationResource> {

    public NotificationResourceAssembler() {
        super(NotificationController.class, NotificationResource.class);
    }

    @Override
    public NotificationResource toModel(NotificationDTO dto) {
        NotificationResource resource = new NotificationResource(dto);
        // principal is null as it's just for link structure
        resource.add(linkTo(methodOn(NotificationController.class).getMyNotifications(null)).withRel("notifications"));
        return resource;
    }
}
