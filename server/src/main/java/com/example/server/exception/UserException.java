package com.example.server.exception;

import org.springframework.http.HttpStatus;

public class UserException extends Exception {
    private final HttpStatus status;
    
    public UserException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST; // Default status
    }
    
    public UserException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
    
    public HttpStatus getStatus() {
        return status;
    }
}
