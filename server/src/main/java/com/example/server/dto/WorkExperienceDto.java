package com.example.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkExperienceDto {
    private Long id;
    private String position;
    private String company;
    private boolean isCurrent;
    private Integer startYear;
    private Integer endYear;
}
