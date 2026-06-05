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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
public class LeetCodeProblemSeeder {

    private final RestTemplate restTemplate;
    private final ProblemRepository problemRepository;
    private final TransactionTemplate transactionTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        new Thread(this::seedProblems).start();
    }

    public void seedProblems() {
        log.info("Starting LeetCode problem seeding via Alfa API...");
        int limit = 100;
        int skip = 0;
        int totalQuestions = Integer.MAX_VALUE;

        while (skip < totalQuestions) {
            String url = "https://alfa-leetcode-api.onrender.com/problems?limit=" + limit + "&skip=" + skip;

            try {
                ResponseEntity<AlfaProblemResponse> response = restTemplate.getForEntity(url, AlfaProblemResponse.class);
                if (response.getBody() == null || response.getBody().getProblemsetQuestionList() == null) {
                    log.error("Failed to fetch LC problems from Alfa API");
                    break;
                }

                if (response.getBody().getTotalQuestions() != null) {
                    totalQuestions = response.getBody().getTotalQuestions();
                }

                List<AlfaProblem> questions = response.getBody().getProblemsetQuestionList();
                if (questions.isEmpty()) {
                    break;
                }

                final int currentSkip = skip;
                transactionTemplate.executeWithoutResult(status -> {
                    List<Problem> existingProblemsList = problemRepository.findByPlatform(Platform.LEETCODE);

                    Map<String, Problem> existingMap = existingProblemsList.stream()
                            .collect(Collectors.toMap(Problem::getExternalId, p -> p, (a, b) -> a));

                    List<Problem> toSave = new ArrayList<>();

                    for (AlfaProblem q : questions) {
                        if (q.getTitleSlug() == null) continue;
                        String externalId = q.getTitleSlug();

                        Problem problem = existingMap.get(externalId);
                        if (problem == null) {
                            problem = Problem.builder()
                                    .externalId(externalId)
                                    .platform(Platform.LEETCODE)
                                    .build();
                        }

                        problem.setName(q.getTitle());
                        problem.setUrl("https://leetcode.com/problems/" + q.getTitleSlug());
                        problem.setDifficulty(q.getDifficulty() != null ? q.getDifficulty().toUpperCase() : null);
                        problem.setRating(null);
                        problem.setSolvedCount(0);

                        if (problem.getTags() == null) {
                            problem.setTags(new ArrayList<>());
                        } else {
                            problem.getTags().clear();
                        }

                        if (q.getTopicTags() != null) {
                            for (AlfaTopicTag tag : q.getTopicTags()) {
                                problem.addTag(ProblemTag.builder().tag(tag.getSlug()).build());
                            }
                        }

                        toSave.add(problem);
                    }

                    problemRepository.saveAll(toSave);
                    log.info("Successfully seeded {} LeetCode problems (skip={})", toSave.size(), currentSkip);
                });

                skip += limit;
                Thread.sleep(500); // Prevent rate-limiting

            } catch (Exception e) {
                log.error("Error during LC problem seeding: ", e);
                break;
            }
        }
        log.info("Finished LeetCode problem seeding.");
    }

    @Data
    public static class AlfaProblemResponse {
        private Integer totalQuestions;
        private Integer count;
        private List<AlfaProblem> problemsetQuestionList;
    }

    @Data
    public static class AlfaProblem {
        private String questionFrontendId;
        private String title;
        private String titleSlug;
        private String difficulty;
        private List<AlfaTopicTag> topicTags;
    }

    @Data
    public static class AlfaTopicTag {
        private String name;
        private String id;
        private String slug;
    }
}
