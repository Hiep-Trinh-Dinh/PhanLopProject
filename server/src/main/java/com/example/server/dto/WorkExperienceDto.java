package com.example.server.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkExperienceDto implements Serializable{
    private Long id;
    private String position;
    private String company;
    private boolean isCurrent;
    private Integer startYear;
    private Integer endYear;
}
