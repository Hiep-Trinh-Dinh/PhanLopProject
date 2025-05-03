package com.example.server.repositories;

import com.example.server.models.Notification;
import com.example.server.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Lấy tất cả thông báo của một user (phân trang)
    Page<Notification> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Lấy tất cả thông báo chưa đọc của một user
    List<Notification> findByUserAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(User user);
    
    // Đếm số lượng thông báo chưa đọc
    Long countByUserAndIsReadFalseAndIsDeletedFalse(User user);
    
    // Cập nhật trạng thái đã đọc cho tất cả thông báo của một user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user AND n.isRead = false")
    void markAllAsRead(User user);
} 