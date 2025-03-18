import { notFound } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import PostDetail from "@/components/post/post-detail"

// This would typically come from a database
const getPost = (id: string) => {
  // Mock data for a specific post
  const posts = {
    "1": {
      id: 1,
      user: {
        id: 1,
        name: "Jane Smith",
        avatar: "/placeholder-user.jpg",
        username: "janesmith",
      },
      content: "Just finished a great book! What are you all reading these days? 📚",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 5,
      shares: 2,
      hasLiked: false,
    },
    "2": {
      id: 2,
      user: {
        id: 2,
        name: "Mike Johnson",
        avatar: "/placeholder-user.jpg",
        username: "mikejohnson",
      },
      content: "Beautiful sunset at the beach today! 🌅",
      image: "/placeholder.svg",
      timestamp: "5 hours ago",
      likes: 56,
      comments: 8,
      shares: 3,
      hasLiked: true,
    },
    "3": {
      id: 3,
      user: {
        id: 3,
        name: "Sarah Williams",
        avatar: "/placeholder-user.jpg",
        username: "sarahwilliams",
      },
      content:
        "Just got my new gaming setup! Can't wait to try it out this weekend. Who's up for some multiplayer action?",
      timestamp: "1 day ago",
      likes: 42,
      comments: 12,
      shares: 5,
      hasLiked: false,
    },
  }

  return posts[id as keyof typeof posts]
}

export default function PostPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the post data from an API
  const post = getPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl">
        <PostDetail post={post} />
      </div>
    </MainLayout>
  )
}

