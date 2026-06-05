package com.cpaggregator.model.dto;

import com.cpaggregator.model.enums.Platform;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDTO {
    private Long id;
    private String externalId;
    private Platform platform;
    private String name;
    private String url;
    private Integer rating;
    private String difficulty;
    private Integer solvedCount;
    private List<String> tags;
}
