package com.cpaggregator.model.entity;

import com.cpaggregator.model.enums.Platform;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "user_attempted_contests", uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_platform_contest", columnNames = {"user_id", "platform", "contest_external_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAttemptedContest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false)
    private Platform platform;

    @Column(name = "contest_external_id", nullable = false, length = 100)
    private String contestExternalId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
