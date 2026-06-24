package com.sliit.library.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class LibraryException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public LibraryException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public LibraryException(String message, HttpStatus status) {
        this(message, status, "LIBRARY_ERROR");
    }

    public LibraryException(String message) {
        this(message, HttpStatus.BAD_REQUEST, "LIBRARY_ERROR");
    }

    // Common factory methods
    public static LibraryException notFound(String resource, String identifier) {
        return new LibraryException(
                String.format("%s not found with identifier: %s", resource, identifier),
                HttpStatus.NOT_FOUND,
                "NOT_FOUND"
        );
    }

    public static LibraryException unauthorized(String message) {
        return new LibraryException(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }

    public static LibraryException forbidden(String message) {
        return new LibraryException(message, HttpStatus.FORBIDDEN, "FORBIDDEN");
    }

    public static LibraryException conflict(String message) {
        return new LibraryException(message, HttpStatus.CONFLICT, "CONFLICT");
    }

    public static LibraryException validation(String message) {
        return new LibraryException(message, HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR");
    }
}
