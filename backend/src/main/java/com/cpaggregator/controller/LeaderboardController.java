package com.cpaggregator.controller;

import com.cpaggregator.model.dto.user.UserPlatformDto;
import com.cpaggregator.model.dto.user.UserResponse;
import com.cpaggregator.model.entity.User;
import com.cpaggregator.model.entity.UserPlatform;
import com.cpaggregator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserRepository userRepository;

    @GetMapping("/global")
    public ResponseEntity<List<UserResponse>> getGlobalLeaderboard() {
        List<User> users = userRepository.findAll();
        
        List<UserResponse> leaderboard = users.stream()
                .map(this::mapToUserResponse)
                .sorted(Comparator.comparing(UserResponse::getTotalSolved).reversed())
                .collect(Collectors.toList());

        return ResponseEntity.ok(leaderboard);
    }

    private UserResponse mapToUserResponse(User user) {
        List<UserPlatformDto> platformsList = new ArrayList<>();
        if (user.getPlatforms() != null) {
            for (UserPlatform up : user.getPlatforms()) {
                platformsList.add(UserPlatformDto.builder()
                        .platform(up.getPlatform())
                        .handle(up.getHandle())
                        .syncedAt(up.getLastSyncedAt())
                        .build());
            }
        }

        int totalSolved = user.getSolvedProblems() != null ? user.getSolvedProblems().size() : 0;

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .platforms(platformsList)
                .totalSolved(totalSolved)
                .build();
    }
}
