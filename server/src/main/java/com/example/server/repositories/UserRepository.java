package com.example.server.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.server.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUser(@Param("query") String query);

    User findUserById(Long userId);

    User existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
    "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
    "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
    "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> findByNameOrEmailContainingIgnoreCase(
        @Param("query") String query,
        Pageable pageable);
        
    /**
     * Tìm kiếm nâng cao hỗ trợ tìm kiếm tên đầy đủ và tìm kiếm từng từ
     * - Tìm kiếm từng trường riêng lẻ (firstName, lastName, email)
     * - Tìm kiếm kết hợp (firstName + lastName)
     * - Tìm kiếm phân tách từ (tách query thành các từ riêng lẻ và tìm kiếm mỗi từ)
     */
    @Query(nativeQuery = true, value = 
           // Sử dụng native query để tận dụng các hàm của SQL
           "SELECT DISTINCT u.* FROM users u WHERE " +
           // Tìm kiếm chuỗi đầy đủ trong từng trường riêng lẻ
           "LOWER(u.first_name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.last_name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           // Tìm kiếm tên đầy đủ (firstName + lastName)
           "LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           // Tìm kiếm họ + tên (lastName + firstName)
           "LOWER(CONCAT(u.last_name, ' ', u.first_name)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           // Trường hợp đặc biệt: từ thứ 1 là firstName, từ thứ 2 là lastName
           "(CASE WHEN :firstWord IS NOT NULL AND :secondWord IS NOT NULL THEN " +
           "  (LOWER(u.first_name) LIKE LOWER(CONCAT('%', :firstWord, '%')) AND " +
           "   LOWER(u.last_name) LIKE LOWER(CONCAT('%', :secondWord, '%'))) " +
           "ELSE false END) OR " +
           // Trường hợp ngược lại: từ thứ 1 là lastName, từ thứ 2 là firstName
           "(CASE WHEN :firstWord IS NOT NULL AND :secondWord IS NOT NULL THEN " +
           "  (LOWER(u.last_name) LIKE LOWER(CONCAT('%', :firstWord, '%')) AND " +
           "   LOWER(u.first_name) LIKE LOWER(CONCAT('%', :secondWord, '%'))) " +
           "ELSE false END)",
           countQuery = "SELECT COUNT(DISTINCT u.id) FROM users u WHERE " +
           "LOWER(u.first_name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.last_name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CONCAT(u.last_name, ' ', u.first_name)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(CASE WHEN :firstWord IS NOT NULL AND :secondWord IS NOT NULL THEN " +
           "  (LOWER(u.first_name) LIKE LOWER(CONCAT('%', :firstWord, '%')) AND " +
           "   LOWER(u.last_name) LIKE LOWER(CONCAT('%', :secondWord, '%'))) " +
           "ELSE false END) OR " +
           "(CASE WHEN :firstWord IS NOT NULL AND :secondWord IS NOT NULL THEN " +
           "  (LOWER(u.last_name) LIKE LOWER(CONCAT('%', :firstWord, '%')) AND " +
           "   LOWER(u.first_name) LIKE LOWER(CONCAT('%', :secondWord, '%'))) " +
           "ELSE false END)")
    Page<User> searchUserAdvanced(
        @Param("query") String query,
        @Param("firstWord") String firstWord,
        @Param("secondWord") String secondWord,
        Pageable pageable);
    
    /**
     * Tìm kiếm user theo tên hoặc email (cho admin)
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> findByNameOrEmail(@Param("query") String query, Pageable pageable);
    
    /**
     * Tìm kiếm user theo tên hoặc email và trạng thái kích hoạt
     */
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND u.isActive = :isActive")
    Page<User> findByNameOrEmailAndStatus(
        @Param("query") String query, 
        @Param("isActive") boolean isActive,
        Pageable pageable);
    
    /**
     * Tìm user theo trạng thái kích hoạt
     */
    Page<User> findByIsActive(boolean isActive, Pageable pageable);
}
