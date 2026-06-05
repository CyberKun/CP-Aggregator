package com.cpaggregator.controller;

import com.cpaggregator.model.dto.ProblemDTO;
import com.cpaggregator.model.dto.ProblemFilterRequest;
import com.cpaggregator.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @PostMapping("/search")
    public ResponseEntity<Page<ProblemDTO>> searchProblems(
            @RequestBody ProblemFilterRequest filterRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            org.springframework.security.core.Authentication authentication) {
        
        Sort sort = Sort.unsorted();
        if (filterRequest.getSortBy() != null && !filterRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = Sort.Direction.ASC;
            if ("desc".equalsIgnoreCase(filterRequest.getSortDir())) {
                direction = Sort.Direction.DESC;
            }
            sort = Sort.by(direction, filterRequest.getSortBy());
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        String username = authentication != null ? authentication.getName() : null;
        Page<ProblemDTO> result = problemService.searchProblems(filterRequest, pageable, username);
        return ResponseEntity.ok(result);
    }
}
