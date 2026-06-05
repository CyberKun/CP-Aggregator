package com.cpaggregator.model.dto.analytics;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnalyticsResponse {

    private List<ChartData> platformData;
    private List<ChartData> difficultyData;
    private List<ChartData> tagData;
    // We could add activity later if needed
    // private List<ActivityData> activityData;

    @Data
    @Builder
    public static class ChartData {
        private String name;
        private Integer value;
    }
}
