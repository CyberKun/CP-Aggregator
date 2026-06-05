package com.cpaggregator.model.entity;

import com.cpaggregator.model.enums.Platform;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"platform", "external_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id", nullable = false)
    private String externalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    private Integer rating;

    private String difficulty;

    @Column(name = "solved_count")
    private Integer solvedCount;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<ProblemTag> tags = new ArrayList<>();

    public void addTag(ProblemTag tag) {
        tags.add(tag);
        tag.setProblem(this);
    }
}
