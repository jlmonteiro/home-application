plugins {
	java
	groovy
	alias(libs.plugins.spring.boot)
	alias(libs.plugins.spring.dependency.management)
	jacoco
}

group = "com.jorgemonteiro"
version = "0.0.1-SNAPSHOT"
description = "Backend application for home management"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(libs.versions.java.get().toInt())
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation(libs.bundles.spring.boot.starters)
	compileOnly(libs.lombok)
	developmentOnly(libs.bundles.spring.boot.dev)
	runtimeOnly(libs.micrometer.prometheus)
	runtimeOnly(libs.postgresql)
	annotationProcessor(libs.lombok)
	testImplementation(libs.bundles.spring.boot.test)
	testImplementation(libs.bundles.testcontainers)
	testImplementation(libs.bundles.spock)
	testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
	useJUnitPlatform()
	finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
	dependsOn(tasks.test)
	reports {
		xml.required = true
		html.required = true
	}
	classDirectories.setFrom(
		files(classDirectories.files.map {
			fileTree(it) {
				exclude("**/exception/**")
				exclude("**/HomeApplication.class")
			}
		})
	)
}
