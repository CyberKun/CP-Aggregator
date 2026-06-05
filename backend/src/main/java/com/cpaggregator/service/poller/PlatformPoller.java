package com.cpaggregator.service.poller;

import com.cpaggregator.model.entity.Contest;
import com.cpaggregator.model.enums.Platform;

import java.util.List;

public interface PlatformPoller {

    List<Contest> poll();

    Platform getPlatform();
}
