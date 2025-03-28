// src/main/java/com/example/server/repositories/UserRepository.java
package com.example.server.repositories;

import com.example.server.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    //Tìm người dùng bằng địa chỉ email
    Optional<Users> findByEmail(String email);
}
