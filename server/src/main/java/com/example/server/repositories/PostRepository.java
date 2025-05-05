package com.example.server.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.server.models.Post;
import com.example.server.models.Post.Privacy;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByPrivacy(Post.Privacy privacy, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.privacy = :privacy OR p.user.id = :userId")
    Page<Post> findByPrivacyOrUserId(@Param("privacy") Post.Privacy privacy, @Param("userId") Long userId, Pageable pageable);
    
    // Find all posts by a specific user
    Page<Post> findByUserId(Long userId, Pageable pageable);
    
    // Find all posts by a specific user with specific privacy setting
    Page<Post> findByUserIdAndPrivacy(Long userId, Post.Privacy privacy, Pageable pageable);
    
    // Find all posts that have been reposted by a specific user
    @Query("SELECT p FROM Post p JOIN p.repostUsers u WHERE u.id = :userId ORDER BY p.createdAt DESC")
    Page<Post> findPostsRepostedByUser(@Param("userId") Long userId, Pageable pageable);
    
    // Search posts by content, respecting privacy settings
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:query% AND p.privacy = :privacy")
    Page<Post> searchPublicPosts(@Param("query") String query, @Param("privacy") Post.Privacy privacy, Pageable pageable);
    
    // Search posts for authenticated users, showing public posts and their own posts
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:query% AND (p.privacy = :privacy OR p.user.id = :userId)")
    Page<Post> searchPostsForUser(@Param("query") String query, @Param("privacy") Post.Privacy privacy, @Param("userId") Long userId, Pageable pageable);
    
    // Tìm tất cả bài viết đang hiển thị (isActive = 0)
    @Query("SELECT p FROM Post p WHERE p.isActive = false")
    Page<Post> findByIsActiveFalse(Pageable pageable);
    
    // Tìm tất cả bài viết đang ẩn (isActive = 1)
    @Query("SELECT p FROM Post p WHERE p.isActive = true")
    Page<Post> findByIsActiveTrue(Pageable pageable);
    
    // Tìm kiếm bài viết theo nội dung và người dùng
    @Query("SELECT p FROM Post p WHERE (p.content LIKE %:query% OR p.user.firstName LIKE %:query% OR p.user.lastName LIKE %:query%) AND p.isActive = false")
    Page<Post> searchActivePosts(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE (p.content LIKE %:query% OR p.user.firstName LIKE %:query% OR p.user.lastName LIKE %:query%) AND p.isActive = true")
    Page<Post> searchInactivePosts(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:query% OR p.user.firstName LIKE %:query% OR p.user.lastName LIKE %:query%")
    Page<Post> searchAllPosts(@Param("query") String query, Pageable pageable);
    
    // Tìm bài viết theo quyền riêng tư hoặc userId và trạng thái hiển thị
    @Query("SELECT p FROM Post p WHERE (p.privacy = :privacy OR p.user.id = :userId) AND p.isActive = false")
    Page<Post> findByPrivacyOrUserIdAndIsActiveFalse(@Param("privacy") Post.Privacy privacy, @Param("userId") Long userId, Pageable pageable);
    
    // Tìm bài viết theo quyền riêng tư và trạng thái hiển thị
    @Query("SELECT p FROM Post p WHERE p.privacy = :privacy AND p.isActive = false")
    Page<Post> findByPrivacyAndIsActiveFalse(@Param("privacy") Post.Privacy privacy, Pageable pageable);
    
    // Tìm bài viết đang hiển thị theo userId
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND p.isActive = false")
    Page<Post> findByUserIdAndIsActiveFalse(@Param("userId") Long userId, Pageable pageable);
    
    // Tìm bài viết đang hiển thị theo userId và quyền riêng tư
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND p.privacy = :privacy AND p.isActive = false")
    Page<Post> findByUserIdAndPrivacyAndIsActiveFalse(@Param("userId") Long userId, @Param("privacy") Post.Privacy privacy, Pageable pageable);
    
    // Tìm kiếm bài viết công khai đang hiển thị
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:query% AND p.privacy = :privacy AND p.isActive = false")
    Page<Post> searchActivePublicPosts(@Param("query") String query, @Param("privacy") Post.Privacy privacy, Pageable pageable);
    
    // Tìm kiếm bài viết đang hiển thị cho người dùng đã xác thực
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:query% AND (p.privacy = :privacy OR p.user.id = :userId) AND p.isActive = false")
    Page<Post> searchActivePostsForUser(@Param("query") String query, @Param("privacy") Post.Privacy privacy, @Param("userId") Long userId, Pageable pageable);
    
    // Tìm bài viết đang hiển thị đã được chia sẻ bởi người dùng
    @Query("SELECT p FROM Post p JOIN p.repostUsers u WHERE u.id = :userId AND p.isActive = false ORDER BY p.createdAt DESC")
    Page<Post> findActivePostsRepostedByUser(@Param("userId") Long userId, Pageable pageable);

    Page<Post> findByGroupIdAndIsActiveFalse(Long groupId, Pageable pageable);

    Page<Post> findByUserIdAndPrivacyAndIsActiveFalseAndGroupIsNull(Long userId, Privacy public1, Pageable pageable);

    Page<Post> findByUserIdAndIsActiveFalseAndGroupIsNull(Long userId, Pageable pageable);

    Page<Post> findByPrivacyOrUserIdAndIsActiveFalseAndGroupIsNull(Privacy public1, Long userId, Pageable pageable);

    Page<Post> findByPrivacyAndIsActiveFalseAndGroupIsNull(Privacy public1, Pageable pageable);

    Page<Post> findByGroupIdAndIsActiveTrue(Long groupId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.isActive = false AND (" +
       "p.user.id = :userId OR " + // Bài viết của chính user
       "(p.privacy = 'FRIENDS' AND p.user.id IN (SELECT f.friend.id FROM Friendship f WHERE f.user.id = :userId AND f.status = 'ACCEPTED')) OR " + // Bài viết của bạn bè
       "(p.privacy = 'PUBLIC' AND (p.group IS NULL OR p.group IN (SELECT g FROM Group g JOIN g.members m WHERE m.id = :userId))) OR " + // Bài viết công khai
       "(p.group IN (SELECT g FROM Group g JOIN g.members m WHERE m.id = :userId))" + // Bài viết trong nhóm
       ")")
    Page<Post> findByUserIdOrFriendsOrPublicOrGroupMembersAndIsActiveFalse(@Param("userId") Long userId, Pageable pageable);

    Page<Post> findByPrivacyAndGroupIsNullAndIsActiveFalse(Privacy public1, Pageable pageable);
}
