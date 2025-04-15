package com.example.server.models;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "friend_requests")
@NoArgsConstructor
public class FriendRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User sender; // Người gửi yêu cầu

    @ManyToOne
    private User receiver; // Người nhận yêu cầu

    @Enumerated(EnumType.STRING)
    private Status status; // Trạng thái: PENDING, ACCEPTED, REJECTED

    private LocalDateTime createdAt;

    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }

    public FriendRequest(User sender, User receiver) {
        this.sender = sender;
        this.receiver = receiver;
        this.status = Status.PENDING;
        this.createdAt = LocalDateTime.now();
    }
}