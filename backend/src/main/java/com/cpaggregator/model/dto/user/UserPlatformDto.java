package com.cpaggregator.model.dto.user;

import com.cpaggregator.model.enums.Platform;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserPlatformDto {
    private Platform platform;
    private String handle;
    private LocalDateTime syncedAt;
}
