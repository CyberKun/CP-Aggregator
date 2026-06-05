package com.cpaggregator.repository;

import com.cpaggregator.model.entity.User;
import com.cpaggregator.model.entity.UserPlatform;
import com.cpaggregator.model.enums.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPlatformRepository extends JpaRepository<UserPlatform, Long> {
    Optional<UserPlatform> findByUserAndPlatform(User user, Platform platform);
}
