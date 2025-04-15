export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  image?: string;
}

export interface MediaDto {
  mediaType: string;
  url: string;
}

export interface CommentDto {
  id: number;
  content: string;
  user: UserDto;
  createdAt: string;
  updatedAt: string;
  totalLikes: number;
  liked: boolean;
}

export interface PostDto {
  id: number;
  user: UserDto;
  content: string;
  media: MediaDto[];
  privacy: string;
  createdAt: string;
  updatedAt: string;
  totalLikes: number;
  liked: boolean;
  totalReposts: number;
  reposted: boolean;
  repostUserIds: number[];
  totalComments: number;
  previewComments: CommentDto[];
}

export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: PageMetadata;
  _links?: {
    self: { href: string };
    next?: { href: string };
    prev?: { href: string };
    first?: { href: string };
    last?: { href: string };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Logout failed! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error instanceof Error ? error : new Error("Failed to logout");
  }
}

export const PostApi = {
  // Get all posts with pagination
  getAll: async (
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<PostDto>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?page=${page}&size=${size}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Raw posts response:", data);

      return {
        content: data._embedded?.postDtoList || [],
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links,
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error instanceof Error ? error : new Error("Failed to fetch posts");
    }
  },

  // Get single post by ID
  getById: async (id: number): Promise<PostDto> => {
    if (!id || isNaN(id)) {
      throw new Error("Invalid post ID");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response for post", id, ":", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        if (response.status === 403) {
          throw new Error("No permission to view this post");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Raw post response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error instanceof Error ? error : new Error("Failed to fetch post");
    }
  },

  // Create new post
  create: async (formData: FormData): Promise<PostDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      console.log("Raw create post response:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 400) {
          throw new Error("400 Bad Request: Invalid post content");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating post:", error);
      throw error instanceof Error ? error : new Error("Failed to create post");
    }
  },

  // Update post
  update: async (
    id: number,
    content: string,
    privacy: string
  ): Promise<PostDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content, privacy }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to edit this post");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating post:", error);
      throw error instanceof Error ? error : new Error("Failed to update post");
    }
  },

  // Delete post
  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to delete this post");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error instanceof Error ? error : new Error("Failed to delete post");
    }
  },

  // Repost post
  repost: async (postId: number): Promise<PostDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/repost`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to repost this post");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error reposting post:", error);
      throw error instanceof Error ? error : new Error("Failed to repost post");
    }
  },

  // Like/Unlike post
  like: {
    add: async (postId: number): Promise<PostDto> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/likes/post/${postId}`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to like this post");
          }
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error liking post:", error);
        throw error instanceof Error ? error : new Error("Failed to like post");
      }
    },

    remove: async (postId: number): Promise<PostDto> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/likes/post/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to unlike this post");
          }
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error unliking post:", error);
        throw error instanceof Error ? error : new Error("Failed to unlike post");
      }
    },
  },

  // Comments
  comments: {
    getByPostId: async (postId: number): Promise<CommentDto[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comments/post/${postId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to view comments");
          }
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw error instanceof Error ? error : new Error("Failed to fetch comments");
      }
    },

    create: async (postId: number, content: string): Promise<CommentDto> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comments/post/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 400) {
            throw new Error("Comment content is invalid");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to comment");
          }
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error creating comment:", error);
        throw error instanceof Error ? error : new Error("Failed to create comment");
      }
    },

    delete: async (commentId: number): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to delete this comment");
          }
          if (response.status === 404) {
            throw new Error("Comment not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        throw error instanceof Error ? error : new Error("Failed to delete comment");
      }
    },
  },
};