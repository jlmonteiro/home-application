package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.exception.ValidationException
import com.jorgemonteiro.home_app.model.dtos.profiles.AgeGroupConfigDTO
import com.jorgemonteiro.home_app.model.dtos.profiles.FamilyRoleDTO
import com.jorgemonteiro.home_app.repository.profiles.AgeGroupConfigRepository
import com.jorgemonteiro.home_app.repository.profiles.FamilyRoleRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Title

@Title("Settings Service")
@Narrative("""
As an adult household member
I want to manage family roles and age group configuration
So that the household hierarchy is correctly maintained
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SettingsServiceSpec extends BaseIntegrationTest {

    @Autowired
    SettingsService settingsService

    @Autowired
    FamilyRoleRepository familyRoleRepository

    @Autowired
    AgeGroupConfigRepository ageGroupConfigRepository

    // --- Age Groups ---

    def "getAgeGroups should return all age groups sorted by minAge"() {
        when: "getting age groups"
            def result = settingsService.getAgeGroups()

        then: "groups are returned sorted"
            result.size() == 3
            result[0].name() == "Child"
            result[1].name() == "Teenager"
            result[2].name() == "Adult"
    }

    def "updateAgeGroups should update ranges in database"() {
        given: "new age group ranges"
            def groups = settingsService.getAgeGroups()
            def updates = groups.collect { g ->
                if (g.name() == "Child") return new AgeGroupConfigDTO(g.id(), g.name(), 0, 11)
                if (g.name() == "Teenager") return new AgeGroupConfigDTO(g.id(), g.name(), 12, 17)
                return new AgeGroupConfigDTO(g.id(), g.name(), 18, 120)
            }

        when: "updating age groups"
            settingsService.updateAgeGroups(updates)

        then: "database reflects new ranges"
            ageGroupConfigRepository.findByName("Child").get().maxAge == 11
            ageGroupConfigRepository.findByName("Teenager").get().minAge == 12
    }

    def "updateAgeGroups should reject overlapping ranges"() {
        given: "overlapping age ranges"
            def groups = settingsService.getAgeGroups()
            def updates = [
                new AgeGroupConfigDTO(groups[0].id(), "Child", 0, 15),
                new AgeGroupConfigDTO(groups[1].id(), "Teenager", 13, 17),
                new AgeGroupConfigDTO(groups[2].id(), "Adult", 18, 120)
            ]

        when: "updating with overlapping ranges"
            settingsService.updateAgeGroups(updates)

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "updateAgeGroups should reject non-continuous ranges"() {
        given: "non-continuous age ranges (gap between 10 and 14)"
            def groups = settingsService.getAgeGroups()
            def updates = [
                new AgeGroupConfigDTO(groups[0].id(), "Child", 0, 10),
                new AgeGroupConfigDTO(groups[1].id(), "Teenager", 14, 17),
                new AgeGroupConfigDTO(groups[2].id(), "Adult", 18, 120)
            ]

        when: "updating with gaps"
            settingsService.updateAgeGroups(updates)

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    // --- Family Roles ---

    def "getFamilyRoles should return all roles including predefined ones"() {
        when: "getting family roles"
            def result = settingsService.getFamilyRoles()

        then: "predefined roles are present"
            result.any { it.name() == "Mother" && it.immutable() }
            result.any { it.name() == "Father" && it.immutable() }
    }

    def "createFamilyRole should save a new custom role"() {
        when: "creating a custom role"
            def result = settingsService.createFamilyRole(new FamilyRoleDTO(null, "Grandparent", false))

        then: "role is saved as mutable"
            result.id() != null
            result.name() == "Grandparent"
            result.immutable() == false
    }

    def "createFamilyRole should reject duplicate name"() {
        given: "an existing role"
            settingsService.createFamilyRole(new FamilyRoleDTO(null, "Grandparent", false))

        when: "creating a duplicate"
            settingsService.createFamilyRole(new FamilyRoleDTO(null, "Grandparent", false))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "updateFamilyRole should update a custom role"() {
        given: "a custom role"
            def role = settingsService.createFamilyRole(new FamilyRoleDTO(null, "Grandparent", false))

        when: "updating the role"
            def result = settingsService.updateFamilyRole(role.id(), new FamilyRoleDTO(null, "Grandma", false))

        then: "role is updated"
            result.name() == "Grandma"
    }

    def "updateFamilyRole should reject updating immutable roles"() {
        given: "an immutable role"
            def mother = familyRoleRepository.findByName("Mother").get()

        when: "updating the immutable role"
            settingsService.updateFamilyRole(mother.id, new FamilyRoleDTO(null, "Mama", false))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "updateFamilyRole should throw ObjectNotFoundException for non-existent ID"() {
        when: "updating a non-existent role"
            settingsService.updateFamilyRole(999L, new FamilyRoleDTO(null, "Test", false))

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "deleteFamilyRole should delete a custom role"() {
        given: "a custom role"
            def role = settingsService.createFamilyRole(new FamilyRoleDTO(null, "Grandparent", false))

        when: "deleting the role"
            settingsService.deleteFamilyRole(role.id())

        then: "role is removed"
            familyRoleRepository.findByName("Grandparent").isEmpty()
    }

    def "deleteFamilyRole should reject deleting immutable roles"() {
        given: "an immutable role"
            def father = familyRoleRepository.findByName("Father").get()

        when: "deleting the immutable role"
            settingsService.deleteFamilyRole(father.id)

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }
}
