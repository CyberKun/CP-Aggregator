package com.cpaggregator.service.poller;

import com.cpaggregator.model.dto.CodeforcesContestResponse;
import com.cpaggregator.model.dto.CodeforcesContestResponse.CodeforcesContest;
import com.cpaggregator.model.entity.Contest;
import com.cpaggregator.model.enums.ContestPhase;
import com.cpaggregator.model.enums.Platform;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CodeforcesPoller implements PlatformPoller {

    private static final String CODEFORCES_API_URL = "https://codeforces.com/api/contest.list";
    private static final String CODEFORCES_CONTEST_URL = "https://codeforces.com/contest/";

    private final RestTemplate restTemplate;

    @Override
    public Platform getPlatform() {
        return Platform.CODEFORCES;
    }

    @Override
    public List<Contest> poll() {
        log.info("Polling contests from Codeforces...");
        try {
            CodeforcesContestResponse response = restTemplate.getForObject(
                    CODEFORCES_API_URL, CodeforcesContestResponse.class);

            if (response == null || !"OK".equals(response.getStatus()) || response.getResult() == null) {
                log.warn("Codeforces API returned invalid response");
                return Collections.emptyList();
            }

            List<Contest> contests = response.getResult().stream()
                    .map(this::mapToContest)
                    .toList();

            log.info("Successfully polled {} contests from Codeforces", contests.size());
            return contests;

        } catch (RestClientException e) {
            log.error("Failed to poll Codeforces API: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private Contest mapToContest(CodeforcesContest cf) {
        Instant startTime = Instant.ofEpochSecond(cf.getStartTimeSeconds() != null ? cf.getStartTimeSeconds() : 0);
        long durationSecs = cf.getDurationSeconds() != null ? cf.getDurationSeconds() : 0;
        Instant endTime = startTime.plusSeconds(durationSecs);

        return Contest.builder()
                .externalId(String.valueOf(cf.getId()))
                .platform(Platform.CODEFORCES)
                .name(cf.getName())
                .url(CODEFORCES_CONTEST_URL + cf.getId())
                .phase(mapPhase(cf.getPhase()))
                .startTime(startTime)
                .endTime(endTime)
                .durationSeconds((int) durationSecs)
                .contestType(cf.getType())
                .frozen(cf.getFrozen() != null && cf.getFrozen())
                .build();
    }

    private ContestPhase mapPhase(String cfPhase) {
        if (cfPhase == null) {
            return ContestPhase.BEFORE;
        }
        return switch (cfPhase) {
            case "BEFORE" -> ContestPhase.BEFORE;
            case "CODING" -> ContestPhase.CODING;
            case "PENDING_SYSTEM_TEST", "SYSTEM_TEST", "FINISHED" -> ContestPhase.FINISHED;
            default -> ContestPhase.BEFORE;
        };
    }
}
