package com.cpaggregator.service;

import com.cpaggregator.model.dto.ProblemDTO;
import com.cpaggregator.model.dto.ProblemFilterRequest;
import com.cpaggregator.model.entity.Problem;
import com.cpaggregator.model.entity.ProblemTag;
import com.cpaggregator.model.enums.Platform;
import com.cpaggregator.repository.ProblemRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;

    @Transactional(readOnly = true)
    public Page<ProblemDTO> searchProblems(ProblemFilterRequest filter, Pageable pageable, String username) {
        Specification<Problem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Avoid duplicate rows when joining tags
            if (Long.class != query.getResultType()) {
                root.fetch("tags", jakarta.persistence.criteria.JoinType.LEFT);
            }
            query.distinct(true);

            if (filter.getPlatforms() != null && !filter.getPlatforms().isEmpty()) {
                predicates.add(root.get("platform").in(filter.getPlatforms()));
            }

            if (filter.getMinRating() != null || filter.getMaxRating() != null) {
                if (filter.getMinRating() != null && filter.getMaxRating() != null) {
                    predicates.add(cb.between(root.get("rating"), filter.getMinRating(), filter.getMaxRating()));
                } else if (filter.getMinRating() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), filter.getMinRating()));
                } else {
                    predicates.add(cb.lessThanOrEqualTo(root.get("rating"), filter.getMaxRating()));
                }
            }

            if (filter.getDifficulties() != null && !filter.getDifficulties().isEmpty()) {
                predicates.add(root.get("difficulty").in(filter.getDifficulties()));
            }

            if (filter.getTags() != null && !filter.getTags().isEmpty()) {
                Join<Problem, ProblemTag> tagsJoin = root.join("tags");
                predicates.add(tagsJoin.get("tag").in(filter.getTags()));
            }

            if (username != null && filter.getStatus() != null && !filter.getStatus().equals("all")) {
                jakarta.persistence.criteria.Subquery<Long> subquery = query.subquery(Long.class);
                jakarta.persistence.criteria.Root<com.cpaggregator.model.entity.UserSolvedProblem> subRoot = subquery.from(com.cpaggregator.model.entity.UserSolvedProblem.class);
                subquery.select(subRoot.get("problem").get("id"));
                subquery.where(cb.equal(subRoot.get("user").get("username"), username));

                if (filter.getStatus().equalsIgnoreCase("solved")) {
                    predicates.add(root.get("id").in(subquery));
                } else if (filter.getStatus().equalsIgnoreCase("unsolved")) {
                    predicates.add(cb.not(root.get("id").in(subquery)));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Problem> problems = problemRepository.findAll(spec, pageable);
        return problems.map(this::mapToDTO);
    }

    private ProblemDTO mapToDTO(Problem problem) {
        return ProblemDTO.builder()
                .id(problem.getId())
                .externalId(problem.getExternalId())
                .platform(problem.getPlatform())
                .name(problem.getName())
                .url(problem.getUrl())
                .rating(problem.getRating())
                .difficulty(problem.getDifficulty())
                .solvedCount(problem.getSolvedCount())
                .tags(problem.getTags().stream().map(ProblemTag::getTag).toList())
                .build();
    }
}
