package com.jorgemonteiro.home_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Home Application Spring Boot service.
 */
@SpringBootApplication
public class HomeApplication {

	/**
	 * Starts the Spring Boot application.
	 *
	 * @param args command-line arguments passed to the JVM
	 */
	static void main(String[] args) {
		SpringApplication.run(HomeApplication.class, args);
	}
}