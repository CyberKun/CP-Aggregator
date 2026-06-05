package com.cpaggregator.controller;

import com.cpaggregator.model.dto.user.PlatformRequest;
import com.cpaggregator.model.dto.user.UserResponse;
import com.cpaggregator.model.entity.User;
import com.cpaggregator.model.entity.UserPlatform;
import com.cpaggregator.model.enums.Platform;
import com.cpaggregator.repository.UserPlatformRepository;
import com.cpaggregator.repository.UserRepository;
import com.cpaggregator.service.UserSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserPlatformRepository userPlatformRepository;
    private final UserSyncService userSyncService;
    private final com.cpaggregator.repository.UserAttemptedContestRepository userAttemptedContestRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.List<com.cpaggregator.model.dto.user.UserPlatformDto> platformsList = new java.util.ArrayList<>();
        for (UserPlatform up : user.getPlatforms()) {
            platformsList.add(com.cpaggregator.model.dto.user.UserPlatformDto.builder()
                    .platform(up.getPlatform())
                    .handle(up.getHandle())
                    .syncedAt(up.getLastSyncedAt())
                    .build());
        }

        int totalSolved = user.getSolvedProblems() != null ? user.getSolvedProblems().size() : 0;

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .platforms(platformsList)
                .totalSolved(totalSolved)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/platforms")
    public ResponseEntity<?> linkPlatform(@RequestBody PlatformRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<UserPlatform> existing = userPlatformRepository.findByUserAndPlatform(user, request.getPlatform());
        if (existing.isPresent()) {
            UserPlatform up = existing.get();
            up.setHandle(request.getHandle());
            userPlatformRepository.save(up);
        } else {
            UserPlatform up = UserPlatform.builder()
                    .user(user)
                    .platform(request.getPlatform())
                    .handle(request.getHandle())
                    .build();
            userPlatformRepository.save(up);
        }

        return ResponseEntity.ok("Platform linked successfully");
    }

    @PostMapping("/me/sync")
    public ResponseEntity<?> syncPlatforms(Authentication authentication) {
        try {
            String username = authentication.getName();
            userSyncService.syncUser(username);
            return ResponseEntity.ok("Sync triggered successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }
    @GetMapping("/me/contests/attempted")
    public ResponseEntity<java.util.List<String>> getAttemptedContests(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        java.util.List<com.cpaggregator.model.entity.UserAttemptedContest> attempted = userAttemptedContestRepository.findAllByUser(user);
        java.util.List<String> contestIds = new java.util.ArrayList<>();
        for (com.cpaggregator.model.entity.UserAttemptedContest c : attempted) {
            contestIds.add(c.getContestExternalId());
        }
        return ResponseEntity.ok(contestIds);
    }
    private final com.cpaggregator.repository.UserSolvedProblemRepository userSolvedProblemRepository;

    @GetMapping("/me/problems/solved")
    public ResponseEntity<java.util.List<String>> getSolvedProblems(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.List<com.cpaggregator.model.entity.UserSolvedProblem> solved = userSolvedProblemRepository.findAllByUser(user);
        java.util.List<String> problemIds = new java.util.ArrayList<>();
        for (com.cpaggregator.model.entity.UserSolvedProblem p : solved) {
            problemIds.add(p.getProblem().getExternalId());
        }
        return ResponseEntity.ok(problemIds);
    }
}
