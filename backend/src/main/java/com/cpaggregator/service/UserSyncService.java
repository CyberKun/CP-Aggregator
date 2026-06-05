package com.cpaggregator.service;

import com.cpaggregator.model.entity.*;
import com.cpaggregator.model.enums.Platform;
import com.cpaggregator.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSyncService {

    private final UserRepository userRepository;
    private final UserPlatformRepository userPlatformRepository;
    private final ProblemRepository problemRepository;
    private final UserSolvedProblemRepository userSolvedProblemRepository;
    private final UserAttemptedContestRepository userAttemptedContestRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public void syncUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<UserPlatform> cfPlatform = userPlatformRepository.findByUserAndPlatform(user, Platform.CODEFORCES);
        if (cfPlatform.isEmpty()) {
            return;
        }

        String handle = cfPlatform.get().getHandle();
        String url = "https://codeforces.com/api/user.status?handle=" + handle;

        try {
            CFResponse response = restTemplate.getForObject(url, CFResponse.class);
            if (response != null && "OK".equals(response.getStatus()) && response.getResult() != null) {
                java.util.Set<String> processedContests = new java.util.HashSet<>();
                java.util.Set<String> processedProblems = new java.util.HashSet<>();

                for (CFSubmission submission : response.getResult()) {
                    if (submission.getProblem() != null && submission.getProblem().getContestId() != null) {
                        String contestId = String.valueOf(submission.getProblem().getContestId());
                        if (!processedContests.contains(contestId) && !userAttemptedContestRepository.existsByUserAndContestExternalId(user, contestId)) {
                            userAttemptedContestRepository.save(UserAttemptedContest.builder()
                                    .user(user)
                                    .platform(Platform.CODEFORCES)
                                    .contestExternalId(contestId)
                                    .build());
                            processedContests.add(contestId);
                        }
                    }

                    if ("OK".equals(submission.getVerdict()) && submission.getProblem() != null) {
                        String contestId = String.valueOf(submission.getProblem().getContestId());
                        String index = submission.getProblem().getIndex();
                        String externalId = contestId + index;

                        Problem problem = problemRepository.findByPlatformAndExternalId(Platform.CODEFORCES, externalId)
                                .orElseGet(() -> {
                                    Problem p = Problem.builder()
                                            .platform(Platform.CODEFORCES)
                                            .externalId(externalId)
                                            .name(submission.getProblem().getName() != null ? submission.getProblem().getName() : "Codeforces " + externalId)
                                            .url("https://codeforces.com/contest/" + contestId + "/problem/" + index)
                                            .build();
                                    return problemRepository.save(p);
                                });

                        if (!processedProblems.contains(externalId) && !userSolvedProblemRepository.existsByUserAndProblem(user, problem)) {
                            UserSolvedProblem solved = UserSolvedProblem.builder()
                                    .user(user)
                                    .problem(problem)
                                    .platform(Platform.CODEFORCES)
                                    .build();
                            userSolvedProblemRepository.save(solved);
                            processedProblems.add(externalId);
                        }
                    }
                }
                
                UserPlatform up = cfPlatform.get();
                up.setLastSyncedAt(java.time.LocalDateTime.now());
                userPlatformRepository.save(up);
            }
        } catch (Exception e) {
            log.error("Failed to sync codeforces for handle " + handle, e);
        }

        Optional<UserPlatform> lcPlatform = userPlatformRepository.findByUserAndPlatform(user, Platform.LEETCODE);
        if (lcPlatform.isPresent()) {
            String lcHandle = lcPlatform.get().getHandle();
            String lcUrl = "https://alfa-leetcode-api.onrender.com/" + lcHandle + "/acSubmission?limit=10000";
            try {
                LCResponse lcResp = restTemplate.getForObject(lcUrl, LCResponse.class);
                if (lcResp != null && lcResp.getSubmission() != null) {
                    java.util.Set<String> processedLcProblems = new java.util.HashSet<>();
                    for (LCSubmission sub : lcResp.getSubmission()) {
                        String externalId = sub.getTitleSlug();
                        if (externalId == null) continue;
                        Problem problem = problemRepository.findByPlatformAndExternalId(Platform.LEETCODE, externalId)
                                .orElseGet(() -> {
                                    Problem p = Problem.builder()
                                            .platform(Platform.LEETCODE)
                                            .externalId(externalId)
                                            .name(sub.getTitle() != null ? sub.getTitle() : "LeetCode " + externalId)
                                            .url("https://leetcode.com/problems/" + externalId)
                                            .build();
                                    return problemRepository.save(p);
                                });
                        if (!processedLcProblems.contains(externalId) && !userSolvedProblemRepository.existsByUserAndProblem(user, problem)) {
                            UserSolvedProblem solved = UserSolvedProblem.builder()
                                    .user(user)
                                    .problem(problem)
                                    .platform(Platform.LEETCODE)
                                    .build();
                            userSolvedProblemRepository.save(solved);
                            processedLcProblems.add(externalId);
                        }
                    }
                    UserPlatform up = lcPlatform.get();
                    up.setLastSyncedAt(java.time.LocalDateTime.now());
                    userPlatformRepository.save(up);
                }
            } catch (Exception e) {
                log.error("Failed to sync leetcode for handle " + lcHandle, e);
            }
        }
    }

    @Data
    public static class CFResponse {
        private String status;
        private List<CFSubmission> result;
    }

    @Data
    public static class CFSubmission {
        private String verdict;
        private CFProblem problem;
    }

    @Data
    public static class CFProblem {
        private Long contestId;
        private String index;
        private String name;
    }

    @Data
    public static class LCResponse {
        private Integer count;
        private List<LCSubmission> submission;
    }

    @Data
    public static class LCSubmission {
        private String title;
        private String titleSlug;
        private String timestamp;
        private String statusDisplay;
    }
}
