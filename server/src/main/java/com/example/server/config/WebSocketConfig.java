package com.example.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Tiền tố cho các endpoint gửi tin nhắn đến client
        config.enableSimpleBroker("/topic", "/queue", "/user");
        
        // Tiền tố cho các endpoint nhận tin nhắn từ client
        config.setApplicationDestinationPrefixes("/app");
        
        // Cấu hình cho tin nhắn cá nhân
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint chính để kết nối WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000"
                )
                .withSockJS();
    }
} 