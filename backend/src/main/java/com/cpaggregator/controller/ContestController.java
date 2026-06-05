package com.cpaggregator.controller;

import com.cpaggregator.model.dto.ContestDTO;
import com.cpaggregator.model.entity.Contest;
import com.cpaggregator.model.enums.ContestPhase;
import com.cpaggregator.model.enums.Platform;
import com.cpaggregator.service.ContestService;
import com.cpaggregator.service.poller.CodeforcesPoller;
import com.cpaggregator.service.poller.KontestsPoller;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;
    private final CodeforcesPoller codeforcesPoller;
    private final KontestsPoller kontestsPoller;

    @GetMapping
    public ResponseEntity<List<ContestDTO>> getAllContests(
            @RequestParam(required = false) List<String> platforms,
            @RequestParam(required = false) List<String> phases) {

        List<Platform> platformList = null;
        List<ContestPhase> phaseList = null;

        if (platforms != null && !platforms.isEmpty()) {
            platformList = platforms.stream()
                    .map(s -> Platform.valueOf(s.toUpperCase()))
                    .toList();
        }

        if (phases != null && !phases.isEmpty()) {
            phaseList = phases.stream()
                    .map(s -> ContestPhase.valueOf(s.toUpperCase()))
                    .toList();
        }

        List<ContestDTO> contests = contestService.getAllContests(platformList, phaseList);
        return ResponseEntity.ok(contests);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<ContestDTO>> getUpcomingContests() {
        List<ContestDTO> contests = contestService.getUpcomingContests();
        return ResponseEntity.ok(contests);
    }

    @GetMapping("/live")
    public ResponseEntity<List<ContestDTO>> getLiveContests() {
        List<ContestDTO> contests = contestService.getLiveContests();
        return ResponseEntity.ok(contests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestDTO> getContestById(@PathVariable Long id) {
        ContestDTO contest = contestService.getContestById(id);
        if (contest == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(contest);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshContests() {
        log.info("Manual contest refresh triggered");

        List<Contest> cfContests = codeforcesPoller.poll();
        List<Contest> kontestsContests = kontestsPoller.pollAll();

        contestService.upsertContests(cfContests);
        contestService.upsertContests(kontestsContests);
        contestService.updatePhases();

        Map<String, Object> response = Map.of(
                "message", "Contest refresh completed",
                "codeforces", cfContests.size(),
                "kontests", kontestsContests.size(),
                "total", cfContests.size() + kontestsContests.size()
        );

        return ResponseEntity.ok(response);
    }
}
