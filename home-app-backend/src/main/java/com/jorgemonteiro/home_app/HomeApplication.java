package com.jorgemonteiro.home_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Entry point for the Home Application Spring Boot service.
 */
@SpringBootApplication
@EnableFeignClients
@EnableCaching
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
