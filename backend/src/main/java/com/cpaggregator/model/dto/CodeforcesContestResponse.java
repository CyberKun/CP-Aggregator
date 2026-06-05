package com.cpaggregator.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CodeforcesContestResponse {

    private String status;
    private List<CodeforcesContest> result;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CodeforcesContest {

        private Integer id;

        private String name;

        private String type;

        private String phase;

        private Boolean frozen;

        @JsonProperty("durationSeconds")
        private Long durationSeconds;

        @JsonProperty("startTimeSeconds")
        private Long startTimeSeconds;

        @JsonProperty("relativeTimeSeconds")
        private Long relativeTimeSeconds;
    }
}
