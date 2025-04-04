package com.example.server.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 6)
    private String password;
    
    @NotBlank
    private String firstName;
    
    @NotBlank
    private String lastName;
    
    @NotBlank
    private String birthDate;
    
    @NotBlank
    @Pattern(regexp = "male|female|custom", message = "Giới tính không hợp lệ")
    private String gender; // Nhận giá trị "male", "female" hoặc "custom"
}
