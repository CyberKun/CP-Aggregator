package com.cpaggregator.controller;

import com.cpaggregator.model.dto.analytics.AnalyticsResponse;
import com.cpaggregator.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/me")
    public ResponseEntity<AnalyticsResponse> getMyAnalytics(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(analyticsService.getUserAnalytics(username));
    }
}
