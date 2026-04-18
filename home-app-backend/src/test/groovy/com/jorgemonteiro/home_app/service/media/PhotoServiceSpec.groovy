package com.jorgemonteiro.home_app.service.media

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.repository.media.PhotoRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title
import spock.lang.Unroll

import java.util.Base64

@Title("Photo Service")
@Narrative("""
As a system component
I want to manage binary photo storage
So that I can store and retrieve images across different modules (profiles, recipes, shopping)
""")
@SpringBootTest(classes = [HomeApplication])
@Transactional
class PhotoServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    PhotoService photoService

    @Autowired
    PhotoRepository photoRepository

    def "savePhoto should store binary data and return filename when given a clean base64 string"() {
        given: "a simple base64 encoded string (representing a 1x1 transparent PNG)"
            def base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
            def targetName = "test-photo"
            def type = "profile"

        when: "saving the photo"
            def fileName = photoService.savePhoto(base64Data, targetName, type)

        then: "a PNG filename is returned"
            fileName == "test-photo.png"

        and: "the photo is persisted in the repository with correct metadata"
            def persisted = photoRepository.findByName(fileName).get()
            persisted.name == fileName
            persisted.type == type
            persisted.contentType == "image/png"
            persisted.extension == "png"
            Base64.getEncoder().encodeToString(persisted.data) == base64Data
    }

    def "savePhoto should extract content type and extension when given a data URI prefix"() {
        given: "a base64 data URI for a JPEG"
            def prefix = "data:image/jpeg;base64,"
            def data = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcHMTLkFBCGNoQnRxSCjM0lRWGVlcW1gvYDRRiuMxNTAZKCkqNDU2N3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGloc3R1dnd4eXqGhciJipOTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwA/Af/Z"
            def base64Data = prefix + data
            def targetName = "profile-pic"

        when: "saving the photo"
            def fileName = photoService.savePhoto(base64Data, targetName, "profile")

        then: "a JPEG filename is returned and metadata is correctly extracted"
            fileName == "profile-pic.jpeg"
            def persisted = photoRepository.findByName(fileName).get()
            persisted.contentType == "image/jpeg"
            persisted.extension == "jpeg"
            // Use byte array comparison for robustness
            persisted.data == Base64.getDecoder().decode(data)
    }

    def "savePhoto should handle base64 with whitespace and newlines"() {
        given: "a base64 string with spaces and newlines"
            def base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
            def messyData = "  iVBORw0KGgoA\nAAANSUhEUgAAAAEA\r\nAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==  "

        when: "saving the messy photo"
            def fileName = photoService.savePhoto(messyData, "messy", "profile")

        then: "it is decoded correctly"
            def persisted = photoRepository.findByName(fileName).get()
            persisted.data == Base64.getDecoder().decode(base64Data)
    }

    def "getPhoto should return the photo entity when it exists"() {
        given: "a photo already in the repository"
            photoService.savePhoto("SGVsbG8=", "existing", "misc")

        when: "retrieving the photo"
            def result = photoService.getPhoto("existing.png")

        then: "the photo is returned"
            result.name == "existing.png"
            new String(result.data) == "Hello"
    }

    def "getPhoto should throw ObjectNotFoundException when photo does not exist"() {
        when: "retrieving a non-existent photo"
            photoService.getPhoto("ghost.png")

        then: "exception is thrown"
            thrown(ObjectNotFoundException)
    }

    @Unroll
    def "getPhotoUrl should return #expected for input #input"() {
        expect:
            photoService.getPhotoUrl(input) == expected

        where:
            input               | expected
            "photo.png"         | "/api/images/photo.png"
            "http://ext.com/p"  | "http://ext.com/p"
            null                | null
            ""                  | null
    }

    @Unroll
    def "generateFileName should produce clean slug for '#name'"() {
        when:
            def result = photoService.generateFileName(name, "type")

        then:
            result.startsWith(expectedPrefix)

        where:
            name            | expectedPrefix
            "Red Onion"     | "red-onion"
            "Mamma's Pasta" | "mamma-s-pasta"
            "  Spaces  "    | "spaces"
            "!@#Special*&"  | "special"
            null            | "type-"
            ""              | "type-"
    }

    def "savePhoto should return null for empty or null input"() {
        expect:
            photoService.savePhoto(null, "any", "any") == null
            photoService.savePhoto("", "any", "any") == null
    }
}
