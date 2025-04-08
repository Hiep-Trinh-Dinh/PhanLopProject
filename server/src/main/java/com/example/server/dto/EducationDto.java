package com.example.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationDto {
    private Long id;
    private String school;
    private String degree;
    private Boolean isCurrent;
    private Integer startYear;
    private Integer endYear;
}
