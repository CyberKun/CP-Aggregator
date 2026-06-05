package com.cpaggregator.repository;

import com.cpaggregator.model.entity.Contest;
import com.cpaggregator.model.enums.ContestPhase;
import com.cpaggregator.model.enums.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {

    List<Contest> findByPlatformAndPhase(Platform platform, ContestPhase phase);

    List<Contest> findByPhase(ContestPhase phase);

    List<Contest> findByPhaseAndStartTimeAfter(ContestPhase phase, Instant startTime);

    List<Contest> findByPlatformIn(List<Platform> platforms);

    List<Contest> findByPhaseInOrderByStartTimeAsc(List<ContestPhase> phases);

    Optional<Contest> findByPlatformAndExternalId(Platform platform, String externalId);
}
