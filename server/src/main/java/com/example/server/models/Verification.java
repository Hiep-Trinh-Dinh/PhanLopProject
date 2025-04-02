package com.example.server.models;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Verification {

    private boolean status = false;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String planType;
}
