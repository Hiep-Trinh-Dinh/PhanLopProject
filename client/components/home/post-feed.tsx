"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from "lucide-react";
import { PostApi } from "@/app/lib/api";
import type { PostDto, CommentDto } from "@/app/lib/api";

interface PostProps {
  id: number;
  liked: boolean;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    image?: string;
  };
  content: string;
  media: { mediaType: string; url: string }[];
  createdAt: string;
  totalLikes: number;
  totalComments: number;
  totalReposts: number;
  reposted: boolean;
  previewComments: CommentDto[];
}

interface PostActionsProps {
  post: PostProps;
  onLike: (id: number) => void;
  onComment: (id: number) => void;
  onRepost: (id: number) => void;
}

interface CommentSectionProps {
  isActive: boolean;
  commentText: string;
  onCommentChange: (text: string) => void;
  onSubmit: () => void;
}

const PostActions = memo(({ post, onLike, onComment, onRepost }: PostActionsProps) => (
  <div className="flex border-t border-gray-800 pt-1">
    <button
      className={`flex flex-1 items-center justify-center rounded-md px-3 py-1.5 ${
        post.liked ? "text-blue-500" : "text-gray-400"
      } hover:bg-gray-800`}
      onClick={() => onLike(post.id)}
    >
      {post.liked ? (
        <Heart className="mr-1 h-5 w-5 fill-blue-500" />
      ) : (
        <ThumbsUp className="mr-1 h-5 w-5" />
      )}
      <span>Like</span>
    </button>
    <button
      className="flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-gray-400 hover:bg-gray-800"
      onClick={() => onComment(post.id)}
    >
      <MessageCircle className="mr-1 h-5 w-5" />
      <span>Comment</span>
    </button>
    <button
      className={`flex flex-1 items-center justify-center rounded-md px-3 py-1.5 ${
        post.reposted ? "text-green-500" : "text-gray-400"
      } hover:bg-gray-800`}
      onClick={() => onRepost(post.id)}
    >
      <Share2 className="mr-1 h-5 w-5" />
      <span>{post.reposted ? "Reposted" : "Share"}</span>
    </button>
  </div>
));
PostActions.displayName = "PostActions";

const CommentSection = memo(({ isActive, commentText, onCommentChange, onSubmit }: CommentSectionProps) => {
  if (!isActive) return null;

  return (
    <div className="mt-3 flex items-start space-x-2">
      <div className="h-8 w-8 rounded-full">
        <Image
          src="/placeholder-user.jpg"
          alt="Your avatar"
          width={32}
          height={32}
          sizes="32px"
          className="h-8 w-8 object-cover rounded-full"
          placeholder="blur"
          blurDataURL="/placeholder-user.jpg"
        />
      </div>
      <div className="flex-1">
        <textarea
          placeholder="Write a comment..."
          className="min-h-[60px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={commentText}
          onChange={(e) => onCommentChange(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={onSubmit}
            disabled={!commentText.trim()}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
});
CommentSection.displayName = "CommentSection";

const Comment = memo(({ comment }: { comment: CommentDto }) => (
  <div className="mt-3 flex items-start space-x-2">
    <div className="h-8 w-8 rounded-full">
      <Image
        src={comment.user.image || "/placeholder-user.jpg"}
        alt={`${comment.user.firstName} ${comment.user.lastName}`}
        width={32}
        height={32}
        className="h-8 w-8 object-cover rounded-full"
        placeholder="blur"
        blurDataURL="/placeholder-user.jpg"
        onError={(e) => {
        }}
      />
    </div>
    <div className="flex-1 rounded-md bg-gray-800 p-3">
      <Link
        href={`/profile/${comment.user.username}`}
        className="font-semibold text-white hover:underline"
      >
        {comment.user.firstName} {comment.user.lastName}
      </Link>
      <p className="mt-1 text-white">{comment.content}</p>
      <p className="mt-1 text-xs text-gray-400">
        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
      </p>
    </div>
  </div>
));
Comment.displayName = "Comment";

export default function PostFeed() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [commentText, setCommentText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await PostApi.getAll(0, 10);
        console.log("Fetched posts:", response.content);
        const mappedPosts = response.content.map((post: PostDto) => ({
          id: post.id,
          liked: post.liked,
          user: {
            id: post.user.id,
            firstName: post.user.firstName,
            lastName: post.user.lastName,
            username: post.user.username,
            image: post.user.image || "/placeholder-user.jpg",
          },
          content: post.content,
          media: post.media || [],
          createdAt: post.createdAt,
          totalLikes: post.totalLikes,
          totalComments: post.totalComments,
          totalReposts: post.totalReposts,
          reposted: post.reposted,
          previewComments: post.previewComments || [],
        }));
        setPosts(mappedPosts);
      } catch (err: any) {
        console.error("Fetch posts error:", err);
        setError(err.message || "Failed to load posts");
        if (err.message.includes("Unauthorized")) {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId: number) => {
    try {
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) return;

      const updatedPost = posts[postIndex].liked
        ? await PostApi.like.remove(postId)
        : await PostApi.like.add(postId);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: updatedPost.liked, totalLikes: updatedPost.totalLikes }
            : p
        )
      );
    } catch (err: any) {
      console.error("Like error:", err);
      if (err.message.includes("Unauthorized")) {
        window.location.href = "/login";
      }
    }
  };

  const handleComment = (postId: number) => {
    setActiveCommentId(activeCommentId === postId ? null : postId);
    setCommentText("");
  };

  const handleRepost = async (postId: number) => {
    try {
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) return;

      const updatedPost = await PostApi.repost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                reposted: updatedPost.reposted,
                totalReposts: updatedPost.totalReposts,
              }
            : p
        )
      );
    } catch (err: any) {
      console.error("Repost error:", err);
      if (err.message.includes("Unauthorized")) {
        window.location.href = "/login";
      }
    }
  };

  const submitComment = async (postId: number) => {
    if (!commentText.trim()) return;

    try {
      const newComment = await PostApi.comments.create(postId, commentText);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                totalComments: post.totalComments + 1,
                previewComments: [newComment, ...post.previewComments.slice(0, 2)],
              }
            : post
        )
      );
      setCommentText("");
      setActiveCommentId(null);
    } catch (err: any) {
      console.error("Comment error:", err);
      if (err.message.includes("Unauthorized")) {
        window.location.href = "/login";
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {posts.length === 0 && !loading && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
          No posts found
        </div>
      )}

      {posts.map((post) => (
        <div key={post.id} className="rounded-lg border border-gray-800 bg-gray-900">
          {/* Post header */}
          <div className="flex items-start justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full">
                <Image
                  src={post.user.image || "/placeholder-user.jpg"}
                  alt={`${post.user.firstName} ${post.user.lastName}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                  placeholder="blur"
                  blurDataURL="/placeholder-user.jpg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-user.jpg";
                  }}
                />
              </div>
              <div>
                <Link
                  href={`/profile/${post.user.username}`}
                  className="font-semibold text-white hover:underline"
                >
                  {post.user.firstName} {post.user.lastName}
                </Link>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
                className="rounded-md p-1 hover:bg-gray-800"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {showDropdown === post.id && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 shadow-lg">
                  <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                    Save Post
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                    Report Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post content */}
          <div className="px-4 pb-3">
            <p className="mb-3 text-white">{post.content}</p>
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-lg">
                {post.media.map((media, index) => (
                  <div key={index} className="relative">
                    {media.mediaType === "VIDEO" ? (
                      <video
                        src={media.url}
                        controls
                        className="h-auto w-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Image
                        src={media.url}
                        alt={`Post media ${index + 1}`}
                        width={600}
                        height={400}
                        className="h-auto w-full object-cover rounded-lg"
                        placeholder="blur"
                        blurDataURL="/placeholder-user.jpg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post stats and actions */}
          <div className="border-t border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between py-1 text-sm text-gray-400">
              <div>{post.totalLikes} likes</div>
              <div>
                <Link href={`/post/${post.id}`} className="hover:underline">
                  {post.totalComments} comments
                </Link>{" "}
                • {post.totalReposts} shares
              </div>
            </div>

            <PostActions
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onRepost={handleRepost}
            />

            {post.previewComments.length > 0 && (
              <div className="mt-3">
                {post.previewComments.map((comment) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            )}

            <CommentSection
              isActive={activeCommentId === post.id}
              commentText={commentText}
              onCommentChange={setCommentText}
              onSubmit={() => submitComment(post.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
