package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.exception.PhotoDownloadException
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import spock.lang.Narrative
import spock.lang.Title

@Title("PhotoService")
@Narrative("""
As the user creation process
I want profile photos to be downloaded and encoded as Base64
So that photos are stored locally and served without depending on external URLs
""")
@SpringBootTest
@ActiveProfiles("test")
class PhotoServiceSpec extends BaseIntegrationTest {

    @Autowired
    PhotoService photoService

    def "downloadAndConvertToBase64 should throw PhotoDownloadException for an unreachable URL"() {
        given: "an unreachable image URL"
            def targetUrl = "http://invalid.local.nonexistent/image.jpg"

        when: "downloading and converting the image"
            photoService.downloadAndConvertToBase64(targetUrl)

        then: "PhotoDownloadException is thrown"
            thrown(PhotoDownloadException)
    }

    def "downloadAndConvertToBase64 should throw PhotoDownloadException for a malformed URL"() {
        given: "a malformed URL"
            def targetUrl = "not-a-valid-url"

        when: "downloading and converting the image"
            photoService.downloadAndConvertToBase64(targetUrl)

        then: "PhotoDownloadException is thrown"
            thrown(PhotoDownloadException)
    }

    def "downloadAndConvertToBase64 should throw PhotoDownloadException for an empty URL"() {
        given: "an empty URL string"
            def targetUrl = ""

        when: "downloading and converting the image"
            photoService.downloadAndConvertToBase64(targetUrl)

        then: "PhotoDownloadException is thrown"
            thrown(PhotoDownloadException)
    }
}
