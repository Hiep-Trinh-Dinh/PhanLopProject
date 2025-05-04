package com.example.server.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.server.dto.AdminUserDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;

public interface AdminUserService {

    /**
     * Kiểm tra user có phải là admin không
     * @param user User cần kiểm tra
     * @return true nếu là admin, false nếu không phải
     */
    boolean isAdmin(User user);
    
    /**
     * Lấy tất cả người dùng kèm phân trang, tìm kiếm, lọc
     * @param query Từ khóa tìm kiếm
     * @param status Trạng thái cần lọc (all, active, locked)
     * @param pageable Thông tin phân trang
     * @return Page<AdminUserDto> Trang kết quả
     */
    Page<AdminUserDto> findAllUsers(String query, String status, Pageable pageable);
    
    /**
     * Lấy thông tin chi tiết người dùng theo ID trả về DTO
     * @param userId ID của người dùng
     * @return AdminUserDto thông tin chi tiết
     * @throws UserException nếu không tìm thấy user
     */
    AdminUserDto findUserDtoById(Long userId) throws UserException;
    
    /**
     * Lấy thông tin chi tiết người dùng theo ID trả về entity
     * @param userId ID của người dùng
     * @return User entity
     * @throws UserException nếu không tìm thấy user
     */
    User findUserById(Long userId) throws UserException;
    
    /**
     * Tạo người dùng mới
     * @param userDto Thông tin người dùng
     * @return AdminUserDto người dùng đã tạo
     * @throws UserException nếu có lỗi
     */
    AdminUserDto createUser(AdminUserDto userDto) throws UserException;
    
    /**
     * Cập nhật thông tin người dùng
     * @param userId ID người dùng cần cập nhật
     * @param userDto Thông tin cập nhật
     * @return AdminUserDto người dùng đã cập nhật
     * @throws UserException nếu không tìm thấy user
     */
    AdminUserDto updateUser(Long userId, AdminUserDto userDto) throws UserException;
    
    /**
     * Khóa hoặc mở khóa người dùng
     * @param userId ID người dùng
     * @param lock true để khóa, false để mở khóa
     * @return AdminUserDto người dùng đã cập nhật
     * @throws UserException nếu không tìm thấy user
     */
    AdminUserDto toggleUserLock(Long userId, boolean lock) throws UserException;
} 