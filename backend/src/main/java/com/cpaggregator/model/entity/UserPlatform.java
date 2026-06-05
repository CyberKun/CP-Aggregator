package com.cpaggregator.model.entity;

import com.cpaggregator.model.enums.Platform;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_platforms", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "platform"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPlatform {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Column(nullable = false)
    private String handle;

    @Column(name = "last_synced_at")
    private java.time.LocalDateTime lastSyncedAt;
}
