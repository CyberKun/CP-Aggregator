package com.cpaggregator.repository;

import com.cpaggregator.model.entity.Problem;
import com.cpaggregator.model.enums.Platform;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long>, JpaSpecificationExecutor<Problem> {
    Optional<Problem> findByPlatformAndExternalId(Platform platform, String externalId);
    
    @EntityGraph(attributePaths = {"tags"})
    List<Problem> findByPlatform(Platform platform);
}
