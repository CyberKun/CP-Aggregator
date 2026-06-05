package com.cpaggregator.service.poller;

import com.cpaggregator.model.entity.Problem;
import com.cpaggregator.model.entity.ProblemTag;
import com.cpaggregator.model.enums.Platform;
import com.cpaggregator.repository.ProblemRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class CodeforcesProblemSeeder {

    private final RestTemplate restTemplate;
    private final ProblemRepository problemRepository;
    private final TransactionTemplate transactionTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        new Thread(this::seedProblems).start();
    }

    public void seedProblems() {
        log.info("Starting Codeforces problem seeding...");
        String url = "https://codeforces.com/api/problemset.problems";

        try {
            ResponseEntity<CFProblemsetResponse> response = restTemplate.getForEntity(url, CFProblemsetResponse.class);
            if (response.getBody() == null || !"OK".equals(response.getBody().getStatus())) {
                log.error("Failed to fetch CF problems");
                return;
            }

            CFResult result = response.getBody().getResult();
            if (result == null || result.getProblems() == null) {
                return;
            }

            transactionTemplate.executeWithoutResult(status -> {
                List<CFProblem> problems = result.getProblems();
                List<CFProblemStatistics> stats = result.getProblemStatistics();

            Map<String, Integer> solvedCountMap = stats == null ? Map.of() : stats.stream()
                    .filter(s -> s.getContestId() != null && s.getIndex() != null)
                    .collect(Collectors.toMap(
                            s -> s.getContestId() + s.getIndex(),
                            CFProblemStatistics::getSolvedCount,
                            (a, b) -> a
                    ));

            List<Problem> existingProblemsList = problemRepository.findByPlatform(Platform.CODEFORCES);
            
            Map<String, Problem> existingMap = existingProblemsList.stream()
                    .collect(Collectors.toMap(Problem::getExternalId, p -> p, (a, b) -> a));

            List<Problem> toSave = new ArrayList<>();

            for (CFProblem cp : problems) {
                if (cp.getContestId() == null || cp.getIndex() == null) continue;
                String externalId = cp.getContestId() + cp.getIndex();
                
                Problem problem = existingMap.get(externalId);
                if (problem == null) {
                    problem = Problem.builder()
                            .externalId(externalId)
                            .platform(Platform.CODEFORCES)
                            .build();
                }

                problem.setName(cp.getName());
                problem.setUrl("https://codeforces.com/problemset/problem/" + cp.getContestId() + "/" + cp.getIndex());
                problem.setRating(cp.getRating());
                problem.setSolvedCount(solvedCountMap.getOrDefault(externalId, 0));
                // Codeforces does not use EASY/MEDIUM/HARD difficulty string
                problem.setDifficulty(null);

                if (problem.getTags() == null) {
                    problem.setTags(new ArrayList<>());
                } else {
                    problem.getTags().clear();
                }

                if (cp.getTags() != null) {
                    for (String tagStr : cp.getTags()) {
                        problem.addTag(ProblemTag.builder().tag(tagStr).build());
                    }
                }
                
                toSave.add(problem);
            }

            problemRepository.saveAll(toSave);
            log.info("Successfully seeded {} Codeforces problems", toSave.size());
            });

        } catch (Exception e) {
            log.error("Error during CF problem seeding: ", e);
        }
    }

    @Data
    public static class CFProblemsetResponse {
        private String status;
        private CFResult result;
    }

    @Data
    public static class CFResult {
        private List<CFProblem> problems;
        private List<CFProblemStatistics> problemStatistics;
    }

    @Data
    public static class CFProblem {
        private Integer contestId;
        private String index;
        private String name;
        private Integer rating;
        private List<String> tags;
    }

    @Data
    public static class CFProblemStatistics {
        private Integer contestId;
        private String index;
        private Integer solvedCount;
    }
}
