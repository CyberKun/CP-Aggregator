package com.cpaggregator.model.dto;

import com.cpaggregator.model.entity.Contest;
import com.cpaggregator.model.enums.ContestPhase;
import com.cpaggregator.model.enums.Platform;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContestDTO {

    private Long id;
    private String externalId;
    private Platform platform;
    private String name;
    private String url;
    private ContestPhase phase;
    private Instant startTime;
    private Instant endTime;
    private Integer durationSeconds;
    private String contestType;
    private Boolean frozen;

    public static ContestDTO fromEntity(Contest contest) {
        return ContestDTO.builder()
                .id(contest.getId())
                .externalId(contest.getExternalId())
                .platform(contest.getPlatform())
                .name(contest.getName())
                .url(contest.getUrl())
                .phase(contest.getPhase())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .durationSeconds(contest.getDurationSeconds())
                .contestType(contest.getContestType())
                .frozen(contest.getFrozen())
                .build();
    }
}
