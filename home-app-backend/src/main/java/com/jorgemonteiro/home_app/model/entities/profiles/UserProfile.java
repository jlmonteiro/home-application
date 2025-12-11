package com.jorgemonteiro.home_app.model.entities.profiles;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "user_profile", schema = "profiles")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserProfile {

    @Id
    @Column(name = "user_email", length = 100)
    private String email;

    @OneToOne
    @JoinColumn(name = "user_email")
    @MapsId
    private User user;

    @Column(columnDefinition = "TEXT")
    private String photo;

    @Column(name = "facebook")
    private String facebook;

    @Column(name = "mobile_phone")
    private String mobilePhone;

    @Column(name = "instagram")
    private String instagram;

    @Column(name = "linkedin")
    private String linkedin;

}
