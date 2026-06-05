package com.cpaggregator.service.poller;

import com.cpaggregator.model.entity.Contest;
import com.cpaggregator.service.ContestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "polling.enabled", havingValue = "true")
public class ContestPollerScheduler {

    private final CodeforcesPoller codeforcesPoller;
    private final KontestsPoller kontestsPoller;
    private final ContestService contestService;

    // Removed onStartup because @Scheduled runs immediately anyway and was causing concurrency issues with H2 DB

    @Scheduled(fixedRateString = "${polling.interval-ms}")
    public void scheduledPoll() {
        log.info("Scheduled contest polling triggered");
        pollAllContests();
    }

    private void pollAllContests() {
        try {
            List<Contest> cfContests = codeforcesPoller.poll();
            List<Contest> kontestsContests = kontestsPoller.pollAll();

            log.info("Polled {} contests from Codeforces, {} from Kontests",
                    cfContests.size(), kontestsContests.size());

            contestService.upsertContests(cfContests);
            contestService.upsertContests(kontestsContests);
            contestService.updatePhases();

            log.info("Contest polling completed successfully. Total upserted: {}",
                    cfContests.size() + kontestsContests.size());

        } catch (Exception e) {
            log.error("Error during contest polling: {}", e.getMessage(), e);
        }
    }
}
