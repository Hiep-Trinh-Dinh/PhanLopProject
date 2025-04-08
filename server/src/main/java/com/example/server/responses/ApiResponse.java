package com.example.server.responses;

import lombok.Data;

@Data
public class ApiResponse {
    private String message;
    private boolean status;
}
