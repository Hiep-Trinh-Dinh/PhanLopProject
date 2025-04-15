package com.example.server.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationDto implements Serializable{
    private Long id;
    private String school;
    private String degree;
    private Boolean isCurrent;
    private Integer startYear;
    private Integer endYear;
}
