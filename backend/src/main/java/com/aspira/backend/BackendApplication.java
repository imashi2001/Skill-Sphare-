package com.aspira.backend;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
		 // Load .env
		 Dotenv dotenv = Dotenv.configure().load();
		  // Set system properties for Spring Boot to use
		  String dbUrl = dotenv.get("DB_URL");
		  String dbUsername = dotenv.get("DB_USERNAME");
		  String dbPassword = dotenv.get("DB_PASSWORD");
		  String jwtSecret = dotenv.get("JWT_SECRET");

		  if (dbUrl == null) System.err.println("Warning: DB_URL is not set in .env");
		  if (dbUsername == null) System.err.println("Warning: DB_USERNAME is not set in .env");
		  if (dbPassword == null) System.err.println("Warning: DB_PASSWORD is not set in .env");
		  if (jwtSecret == null) System.err.println("Warning: JWT_SECRET is not set in .env");

		  if (dbUrl != null) System.setProperty("DB_URL", dbUrl);
		  if (dbUsername != null) System.setProperty("DB_USERNAME", dbUsername);
		  if (dbPassword != null) System.setProperty("DB_PASSWORD", dbPassword);
		  if (jwtSecret != null) System.setProperty("JWT_SECRET", jwtSecret);

        SpringApplication.run(BackendApplication.class, args);
	}

}
