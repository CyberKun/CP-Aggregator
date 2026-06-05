package com.cpaggregator.model.dto.user;

import com.cpaggregator.model.enums.Platform;
import lombok.Data;

@Data
public class PlatformRequest {
    private Platform platform;
    private String handle;
}
