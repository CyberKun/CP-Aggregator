package com.cpaggregator.model.dto.user;

import com.cpaggregator.model.enums.Platform;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private java.util.List<UserPlatformDto> platforms;
    private Integer totalSolved;
}
