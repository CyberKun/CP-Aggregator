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
public class ProblemFilterRequest {
    private List<Platform> platforms;
    private Integer minRating;
    private Integer maxRating;
    private List<String> difficulties;
    private List<String> tags;
    private String sortBy; // "rating", "difficulty", "solvedCount"
    private String sortDir; // "asc", "desc"
    private String status; // "solved", "unsolved", "all"
}
