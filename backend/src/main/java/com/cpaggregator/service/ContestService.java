package com.cpaggregator.service;

import com.cpaggregator.model.dto.ContestDTO;
import com.cpaggregator.model.entity.Contest;
import com.cpaggregator.model.enums.ContestPhase;
import com.cpaggregator.model.enums.Platform;
import com.cpaggregator.repository.ContestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestRepository contestRepository;

    public List<ContestDTO> getAllContests(List<Platform> platforms, List<ContestPhase> phases) {
        List<Contest> contests;

        if (platforms != null && !platforms.isEmpty() && phases != null && !phases.isEmpty()) {
            contests = contestRepository.findAll().stream()
                    .filter(c -> platforms.contains(c.getPlatform()))
                    .filter(c -> phases.contains(c.getPhase()))
                    .toList();
        } else if (platforms != null && !platforms.isEmpty()) {
            contests = contestRepository.findByPlatformIn(platforms);
        } else if (phases != null && !phases.isEmpty()) {
            contests = contestRepository.findByPhaseInOrderByStartTimeAsc(phases);
        } else {
            contests = contestRepository.findAll();
        }

        return contests.stream()
                .map(ContestDTO::fromEntity)
                .toList();
    }

    public List<ContestDTO> getUpcomingContests() {
        return contestRepository.findByPhaseAndStartTimeAfter(ContestPhase.BEFORE, Instant.now())
                .stream()
                .map(ContestDTO::fromEntity)
                .toList();
    }

    public List<ContestDTO> getLiveContests() {
        return contestRepository.findByPhase(ContestPhase.CODING)
                .stream()
                .map(ContestDTO::fromEntity)
                .toList();
    }

    public ContestDTO getContestById(Long id) {
        return contestRepository.findById(id)
                .map(ContestDTO::fromEntity)
                .orElse(null);
    }

    @Transactional
    public void upsertContests(List<Contest> contests) {
        int created = 0;
        int updated = 0;

        for (Contest incoming : contests) {
            Optional<Contest> existing = contestRepository.findByPlatformAndExternalId(
                    incoming.getPlatform(), incoming.getExternalId());

            if (existing.isPresent()) {
                Contest entity = existing.get();
                entity.setName(incoming.getName());
                entity.setUrl(incoming.getUrl());
                entity.setPhase(incoming.getPhase());
                entity.setStartTime(incoming.getStartTime());
                entity.setEndTime(incoming.getEndTime());
                entity.setDurationSeconds(incoming.getDurationSeconds());
                entity.setContestType(incoming.getContestType());
                entity.setFrozen(incoming.getFrozen());
                contestRepository.save(entity);
                updated++;
            } else {
                contestRepository.save(incoming);
                created++;
            }
        }

        log.info("Upsert complete: {} created, {} updated", created, updated);
    }

    @Transactional
    public void updatePhases() {
        Instant now = Instant.now();
        int transitioned = 0;

        // BEFORE → CODING: startTime <= now
        List<Contest> beforeContests = contestRepository.findByPhase(ContestPhase.BEFORE);
        for (Contest contest : beforeContests) {
            if (contest.getStartTime() != null && !contest.getStartTime().isAfter(now)) {
                contest.setPhase(ContestPhase.CODING);
                contestRepository.save(contest);
                transitioned++;
                log.debug("Transitioned contest '{}' from BEFORE to CODING", contest.getName());
            }
        }

        // CODING → FINISHED: endTime <= now
        List<Contest> codingContests = contestRepository.findByPhase(ContestPhase.CODING);
        for (Contest contest : codingContests) {
            if (contest.getEndTime() != null && !contest.getEndTime().isAfter(now)) {
                contest.setPhase(ContestPhase.FINISHED);
                contestRepository.save(contest);
                transitioned++;
                log.debug("Transitioned contest '{}' from CODING to FINISHED", contest.getName());
            }
        }

        if (transitioned > 0) {
            log.info("Phase update: {} contests transitioned", transitioned);
        }
    }
}
