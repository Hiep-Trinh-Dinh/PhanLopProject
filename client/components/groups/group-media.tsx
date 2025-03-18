"use client"

import { useState } from "react"
import Image from "next/image"
import { FileImage, FileVideo } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GroupMediaProps {
  groupId: number
}

// Mock data for group media
const mockPhotos = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  url: "/placeholder.svg",
  title: `Photo ${i + 1}`,\
  uploadedBy: "Jane Smith\",  => ({
  id: i + 1,
  url: "/placeholder.svg",
  title: `Photo ${i + 1}`,
  uploadedBy: "Jane Smith",
  uploadedDate: "2 days ago",
}));

const mockVideos = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  url: "/placeholder.svg",
  title: `Video ${i + 1}`,
  uploadedBy: "Mike Johnson",
  uploadedDate: "1 week ago",
  duration: "2:45",
}))

export default function GroupMedia({ groupId }: GroupMediaProps) {
  const [activeTab, setActiveTab] = useState("photos")

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>Media</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="photos" className="mb-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="photos">
              <FileImage className="mr-2 h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="videos">
              <FileVideo className="mr-2 h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {mockPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-gray-800 bg-gray-800"
                >
                  <Image
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="absolute bottom-0 left-0 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-xs font-medium text-white">{photo.uploadedBy}</p>
                    <p className="text-xs text-gray-300">{photo.uploadedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {mockVideos.map((video) => (
                <div
                  key={video.id}
                  className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-800"
                >
                  <div className="relative aspect-video">
                    <Image src={video.url || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/50 p-3">
                        <FileVideo className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white">{video.title}</h3>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                      <span>{video.uploadedBy}</span>
                      <span>{video.uploadedDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

