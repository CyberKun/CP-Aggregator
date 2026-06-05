package com.cpaggregator.repository;

import com.cpaggregator.model.entity.Problem;
import com.cpaggregator.model.entity.User;
import com.cpaggregator.model.entity.UserSolvedProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSolvedProblemRepository extends JpaRepository<UserSolvedProblem, Long> {
    boolean existsByUserAndProblem(User user, Problem problem);
    java.util.List<UserSolvedProblem> findAllByUser(User user);
}
