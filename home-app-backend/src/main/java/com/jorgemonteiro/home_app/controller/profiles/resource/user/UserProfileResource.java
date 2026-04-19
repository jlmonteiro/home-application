package com.jorgemonteiro.home_app.controller.profiles.resource.user;

import com.jorgemonteiro.home_app.model.dtos.profiles.FamilyRoleDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.SocialProfilesDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO;
import lombok.Getter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

@Getter
@Relation(collectionRelation = "userProfiles", itemRelation = "userProfile")
public class UserProfileResource extends RepresentationModel<UserProfileResource> {
    private final Long id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final Boolean enabled;
    private final PhotoDTO photo;
    private final String mobilePhone;
    private final java.time.LocalDate birthdate;
    private final FamilyRoleDTO familyRole;
    private final String ageGroupName;
    private final SocialProfilesDTO social;

    public UserProfileResource(UserProfileDTO dto) {
        this.id = dto.getId();
        this.email = dto.getEmail();
        this.firstName = dto.getFirstName();
        this.lastName = dto.getLastName();
        this.enabled = dto.getEnabled();
        this.photo = dto.getPhoto();
        this.mobilePhone = dto.getMobilePhone();
        this.birthdate = dto.getBirthdate();
        this.familyRole = dto.getFamilyRole();
        this.ageGroupName = dto.getAgeGroupName();
        this.social = dto.getSocial();
    }
}
