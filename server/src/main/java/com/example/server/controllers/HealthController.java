package com.example.server.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for health check endpoint
 * Used to verify server connectivity
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {
    
    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);
    
    /**
     * Simple health check endpoint that returns 200 OK
     * @return A simple message indicating the server is up and running
     */
    @GetMapping
    public String healthCheck() {
        logger.info("Health check endpoint called");
        return "OK";
    }
} 