package com.example.server.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "likes", indexes = {
    @Index(name = "idx_like_user_id", columnList = "user_id"),
    @Index(name = "idx_like_post_id", columnList = "post_id"),
    @Index(name = "idx_like_comment_id", columnList = "comment_id")
})
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @AssertTrue(message = "Like must be associated with either a post or a comment")
    private boolean isValid() {
        return (post != null && comment == null) || (post == null && comment != null);
    }
}