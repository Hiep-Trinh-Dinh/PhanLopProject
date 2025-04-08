package com.example.server.responses;

import lombok.Data;

@Data
public class ApiResponse {
    public ApiResponse(String string, boolean b) {
        this.message = string;
        this.status = b;
    }
    private String message;
    private boolean status;
}
