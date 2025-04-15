package com.example.server.repositories;

import com.example.server.models.FriendRequest;
import com.example.server.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequest.Status status);
    FriendRequest findBySenderAndReceiver(User sender, User receiver);
}