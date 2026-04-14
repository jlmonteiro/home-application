package com.jorgemonteiro.home_app.controller.profiles.resource.user;

import com.jorgemonteiro.home_app.controller.shopping.resource.HateoasResource;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import org.springframework.hateoas.server.core.Relation;
import java.util.Collections;

@Relation(collectionRelation = "userProfiles", itemRelation = "userProfile")
public class UserProfileResource extends HateoasResource<UserProfileDTO> {
    public UserProfileResource(UserProfileDTO dto) {
        super(dto, Collections.emptyList());
    }
}
