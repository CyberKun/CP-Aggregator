package com.cpaggregator.service.poller;

import com.cpaggregator.model.dto.KontestsContestResponse;
import com.cpaggregator.model.entity.Contest;
import com.cpaggregator.model.enums.ContestPhase;
import com.cpaggregator.model.enums.Platform;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class KontestsPoller {

    private static final Map<Platform, String> PLATFORM_URLS = Map.of(
            Platform.LEETCODE, "https://kontests.net/api/v1/leet_code"
    );

    private static final DateTimeFormatter KONTESTS_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'");

    private final RestTemplate restTemplate;

    public List<Contest> pollAll() {
        log.info("Polling contests from Kontests.net (LeetCode)...");
        List<Contest> allContests = new ArrayList<>();

        for (Map.Entry<Platform, String> entry : PLATFORM_URLS.entrySet()) {
            Platform platform = entry.getKey();
            String url = entry.getValue();
            List<Contest> contests = pollPlatform(platform, url);
            allContests.addAll(contests);
            log.info("Polled {} contests for {} from Kontests.net", contests.size(), platform);
        }

        log.info("Total contests polled from Kontests.net: {}", allContests.size());
        return allContests;
    }

    private List<Contest> pollPlatform(Platform platform, String url) {
        try {
            ResponseEntity<List<KontestsContestResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );

            List<KontestsContestResponse> body = response.getBody();
            if (body == null) {
                log.warn("Kontests API returned null body for {}", platform);
                return Collections.emptyList();
            }

            return body.stream()
                    .map(k -> mapToContest(k, platform))
                    .filter(c -> c != null)
                    .toList();

        } catch (RestClientException e) {
            log.error("Failed to poll Kontests API for {}: {}", platform, e.getMessage());
            return Collections.emptyList();
        }
    }

    private Contest mapToContest(KontestsContestResponse k, Platform platform) {
        try {
            Instant startTime = parseKontestsTime(k.getStartTime());
            Instant endTime = parseKontestsTime(k.getEndTime());
            int durationSeconds = 0;

            if (k.getDuration() != null && !k.getDuration().isBlank()) {
                try {
                    durationSeconds = (int) Double.parseDouble(k.getDuration());
                } catch (NumberFormatException e) {
                    log.warn("Could not parse duration '{}' for contest '{}'", k.getDuration(), k.getName());
                }
            }

            if (endTime == null && startTime != null && durationSeconds > 0) {
                endTime = startTime.plusSeconds(durationSeconds);
            }

            String externalId = generateExternalId(k.getName(), k.getStartTime());

            return Contest.builder()
                    .externalId(externalId)
                    .platform(platform)
                    .name(k.getName())
                    .url(k.getUrl())
                    .phase(mapPhase(k.getStatus()))
                    .startTime(startTime)
                    .endTime(endTime)
                    .durationSeconds(durationSeconds)
                    .frozen(false)
                    .build();

        } catch (Exception e) {
            log.warn("Failed to map Kontests contest '{}': {}", k.getName(), e.getMessage());
            return null;
        }
    }

    private Instant parseKontestsTime(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) {
            return null;
        }
        try {
            LocalDateTime ldt = LocalDateTime.parse(timeStr.trim(), KONTESTS_DATE_FORMAT);
            return ldt.toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException e) {
            log.warn("Could not parse Kontests time '{}': {}", timeStr, e.getMessage());
            return null;
        }
    }

    private ContestPhase mapPhase(String status) {
        if (status == null) {
            return ContestPhase.BEFORE;
        }
        return switch (status.trim().toUpperCase()) {
            case "CODING" -> ContestPhase.CODING;
            case "FINISHED" -> ContestPhase.FINISHED;
            default -> ContestPhase.BEFORE;
        };
    }

    private String generateExternalId(String name, String startTime) {
        String raw = (name != null ? name : "") + "|" + (startTime != null ? startTime : "");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 32);
        } catch (NoSuchAlgorithmException e) {
            // Fallback: use hashCode
            return String.valueOf(raw.hashCode());
        }
    }
}
