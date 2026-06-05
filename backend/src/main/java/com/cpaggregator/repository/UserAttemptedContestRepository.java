package com.cpaggregator.repository;

import com.cpaggregator.model.entity.User;
import com.cpaggregator.model.entity.UserAttemptedContest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAttemptedContestRepository extends JpaRepository<UserAttemptedContest, Long> {
    boolean existsByUserAndContestExternalId(User user, String contestExternalId);
    List<UserAttemptedContest> findAllByUser(User user);
}
