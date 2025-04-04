package com.example.server.models;

import java.time.LocalDateTime;
import java.util.Random;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;

@Entity
@Data
@Table(name = "verifications")
@AllArgsConstructor
public class Verification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "verification_token", nullable = false, unique = true)
    private String code;

    @Column(name = "verification_expiry")
    private LocalDateTime expiryDate;

    public Verification() {
        this.code = generateToken(); // Tạo token ngẫu nhiên gồm 6 chữ số
        this.expiryDate = LocalDateTime.now().plusMinutes(15); // Thời gian hết hạn là 15 phút
    }

    private String generateToken() {
        Random random = new Random();
        int tokenNumber = random.nextInt(1_000_000); // Tạo số ngẫu nhiên từ 0 đến 999999
        return String.format("%06d", tokenNumber); // Định dạng thành chuỗi 6 chữ số
    }
}