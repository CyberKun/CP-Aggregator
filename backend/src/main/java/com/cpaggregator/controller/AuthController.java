package com.cpaggregator.controller;

import com.cpaggregator.model.dto.auth.JwtAuthResponse;
import com.cpaggregator.model.dto.auth.LoginRequest;
import com.cpaggregator.model.dto.auth.RegisterRequest;
import com.cpaggregator.model.entity.User;
import com.cpaggregator.repository.UserRepository;
import com.cpaggregator.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        
        java.util.List<com.cpaggregator.model.dto.user.UserPlatformDto> platformsList = new java.util.ArrayList<>();
        if (user.getPlatforms() != null) {
            for (com.cpaggregator.model.entity.UserPlatform up : user.getPlatforms()) {
                platformsList.add(com.cpaggregator.model.dto.user.UserPlatformDto.builder()
                        .platform(up.getPlatform())
                        .handle(up.getHandle())
                        .syncedAt(up.getLastSyncedAt())
                        .build());
            }
        }
        int totalSolved = user.getSolvedProblems() != null ? user.getSolvedProblems().size() : 0;
        com.cpaggregator.model.dto.user.UserResponse userResponse = com.cpaggregator.model.dto.user.UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .platforms(platformsList)
                .totalSolved(totalSolved)
                .build();

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", jwt);
        response.put("user", userResponse);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new ResponseEntity<>("Username is already taken!", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new ResponseEntity<>("Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();
        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        java.util.List<com.cpaggregator.model.dto.user.UserPlatformDto> platformsList = new java.util.ArrayList<>();
        if (user.getPlatforms() != null) {
            for (com.cpaggregator.model.entity.UserPlatform up : user.getPlatforms()) {
                platformsList.add(com.cpaggregator.model.dto.user.UserPlatformDto.builder()
                        .platform(up.getPlatform())
                        .handle(up.getHandle())
                        .syncedAt(up.getLastSyncedAt())
                        .build());
            }
        }
        int totalSolved = user.getSolvedProblems() != null ? user.getSolvedProblems().size() : 0;
        com.cpaggregator.model.dto.user.UserResponse userResponse = com.cpaggregator.model.dto.user.UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .platforms(platformsList)
                .totalSolved(totalSolved)
                .build();

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", jwt);
        response.put("user", userResponse);
        return ResponseEntity.ok(response);
    }
}
