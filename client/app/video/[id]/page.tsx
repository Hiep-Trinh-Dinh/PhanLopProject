import { notFound } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import VideoDetail from "@/components/videos/video-detail"

// This would typically come from a database
const getVideo = (id: string) => {
  // Mock data for a specific video
  const videos = {
    "1": {
      id: 1,
      title: "Amazing sunset at the beach",
      description: "Captured this beautiful moment during my vacation. #sunset #beach #nature",
      url: "/placeholder.svg",
      thumbnail: "/placeholder.svg",
      views: 12500,
      likes: 1250,
      comments: 85,
      shares: 42,
      createdAt: "2 days ago",
      user: {
        id: 1,
        name: "Jane Smith",
        username: "janesmith",
        avatar: "/placeholder-user.jpg",
        followers: 5600,
      },
    },
    "2": {
      id: 2,
      title: "Quick React.js tip for beginners",
      description: "Here's a useful tip that will help you write cleaner React code. #reactjs #webdev #coding",
      url: "/placeholder.svg",
      thumbnail: "/placeholder.svg",
      views: 8700,
      likes: 945,
      comments: 120,
      shares: 65,
      createdAt: "3 days ago",
      user: {
        id: 2,
        name: "Mike Johnson",
        username: "mikejohnson",
        avatar: "/placeholder-user.jpg",
        followers: 12300,
      },
    },
    "3": {
      id: 3,
      title: "Morning coffee routine",
      description: "My daily ritual for the perfect cup of coffee. #coffee #morning #routine",
      url: "/placeholder.svg",
      thumbnail: "/placeholder.svg",
      views: 5400,
      likes: 620,
      comments: 45,
      shares: 28,
      createdAt: "1 week ago",
      user: {
        id: 3,
        name: "Sarah Williams",
        username: "sarahwilliams",
        avatar: "/placeholder-user.jpg",
        followers: 8900,
      },
    },
    "4": {
      id: 4,
      title: "City lights at night",
      description: "Walking through downtown at night. The city never sleeps! #citylife #night #urban",
      url: "/placeholder.svg",
      thumbnail: "/placeholder.svg",
      views: 9200,
      likes: 1100,
      comments: 72,
      shares: 38,
      createdAt: "5 days ago",
      user: {
        id: 4,
        name: "David Brown",
        username: "davidbrown",
        avatar: "/placeholder-user.jpg",
        followers: 7500,
      },
    },
    "5": {
      id: 5,
      title: "Easy 10-minute workout",
      description: "No equipment needed for this quick but effective workout. #fitness #workout #health",
      url: "/placeholder.svg",
      thumbnail: "/placeholder.svg",
      views: 15800,
      likes: 2200,
      comments: 130,
      shares: 95,
      createdAt: "2 days ago",
      user: {
        id: 5,
        name: "Emily Davis",
        username: "emilydavis",
        avatar: "/placeholder-user.jpg",
        followers: 18700,
      },
    },
  }

  return videos[id as keyof typeof videos]
}

export default function VideoPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the video data from an API
  const video = getVideo(params.id)

  if (!video) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <VideoDetail video={video} />
      </div>
    </MainLayout>
  )
}

