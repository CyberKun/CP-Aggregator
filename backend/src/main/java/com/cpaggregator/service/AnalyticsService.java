package com.cpaggregator.service;

import com.cpaggregator.model.dto.analytics.AnalyticsResponse;
import com.cpaggregator.model.entity.Problem;
import com.cpaggregator.model.entity.ProblemTag;
import com.cpaggregator.model.entity.User;
import com.cpaggregator.model.entity.UserSolvedProblem;
import com.cpaggregator.model.enums.Platform;
import com.cpaggregator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;

    public AnalyticsResponse getUserAnalytics(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<UserSolvedProblem> solvedProblems = user.getSolvedProblems() != null ? user.getSolvedProblems() : new ArrayList<>();

        Map<String, Integer> platformCounts = new HashMap<>();
        Map<String, Integer> difficultyCounts = new HashMap<>();
        Map<String, Integer> tagCounts = new HashMap<>();

        for (UserSolvedProblem usp : solvedProblems) {
            Problem p = usp.getProblem();

            // Platform
            String plat = p.getPlatform().name();
            platformCounts.put(plat, platformCounts.getOrDefault(plat, 0) + 1);

            // Difficulty
            String diff = getNormalizedDifficulty(p);
            difficultyCounts.put(diff, difficultyCounts.getOrDefault(diff, 0) + 1);

            // Tags
            if (p.getTags() != null) {
                for (ProblemTag tag : p.getTags()) {
                    tagCounts.put(tag.getTag(), tagCounts.getOrDefault(tag.getTag(), 0) + 1);
                }
            }
        }

        return AnalyticsResponse.builder()
                .platformData(mapToChartData(platformCounts, null))
                .difficultyData(mapToChartData(difficultyCounts, null))
                .tagData(mapToChartData(tagCounts, 10)) // Top 10 tags
                .build();
    }

    private String getNormalizedDifficulty(Problem p) {
        if (p.getPlatform() == Platform.CODEFORCES) {
            if (p.getRating() == null) return "Unknown";
            int r = p.getRating();
            if (r < 1300) return "Easy";
            if (r <= 1600) return "Medium";
            if (r <= 2000) return "Hard";
            return "Advanced";
        } else if (p.getPlatform() == Platform.LEETCODE) {
            // Leetcode difficulties aren't fetched by API right now, we can say Unknown or try to parse
            return "Unknown";
        }
        return "Unknown";
    }

    private List<AnalyticsResponse.ChartData> mapToChartData(Map<String, Integer> map, Integer limit) {
        List<AnalyticsResponse.ChartData> list = map.entrySet().stream()
                .map(e -> AnalyticsResponse.ChartData.builder().name(e.getKey()).value(e.getValue()).build())
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .collect(Collectors.toList());

        if (limit != null && list.size() > limit) {
            return list.subList(0, limit);
        }
        return list;
    }
}
