package com.sliit.library;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@OpenAPIDefinition(
    info = @Info(
        title = "SLIIT Online Library Management System API",
        version = "1.0.0",
        description = "RESTful API for the SLIIT Online Library Management System. " +
                      "Provides endpoints for book catalogue, user management, " +
                      "loan processing, reservations, fines, and reporting.",
        contact = @Contact(
            name = "SLIIT IT Division",
            email = "it@sliit.lk",
            url = "https://www.sliit.lk"
        ),
        license = @License(
            name = "Internal Use Only",
            url = "https://www.sliit.lk"
        )
    )
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT token authentication. Obtain token via /api/auth/login endpoint."
)
public class OlmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(OlmsApplication.class, args);
    }
}
