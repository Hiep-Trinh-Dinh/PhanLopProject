"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface ProfilePhotosProps {
  userId: number
}

// Mock data for photos
const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  url: "/placeholder.svg",
  title: `Photo ${i + 1}`,
  uploadedDate: "2 days ago",
  album: i % 3 === 0 ? "Profile Pictures" : i % 3 === 1 ? "Timeline Photos" : "Mobile Uploads",
}))

export default function ProfilePhotos({ userId }: ProfilePhotosProps) {
  const [photos] = useState(mockPhotos)
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof mockPhotos)[0] | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const filteredPhotos = photos.filter((photo) => {
    if (activeTab === "all") return true
    return photo.album.toLowerCase() === activeTab.toLowerCase()
  })

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>Photos ({photos.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="all" className="mb-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="all">All Photos</TabsTrigger>
            <TabsTrigger value="profile pictures">Profile Pictures</TabsTrigger>
            <TabsTrigger value="timeline photos">Timeline Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredPhotos.map((photo) => (
                <Dialog key={photo.id}>
                  <DialogTrigger asChild>
                    <div
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-800 bg-gray-800"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      <div className="absolute bottom-0 left-0 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="text-xs font-medium text-white">{photo.album}</p>
                        <p className="text-xs text-gray-300">{photo.uploadedDate}</p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="border-gray-800 bg-gray-900 p-0 text-white sm:max-w-[800px]">
                    <div className="relative aspect-square w-full sm:aspect-video">
                      <Image src={photo.url || "/placeholder.svg"} alt={photo.title} fill className="object-contain" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{photo.title}</h3>
                      <p className="text-sm text-gray-400">
                        {photo.album} • {photo.uploadedDate}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile pictures" className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredPhotos.map((photo) => (
                <Dialog key={photo.id}>
                  <DialogTrigger asChild>
                    <div
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-800 bg-gray-800"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      <div className="absolute bottom-0 left-0 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="text-xs font-medium text-white">{photo.album}</p>
                        <p className="text-xs text-gray-300">{photo.uploadedDate}</p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="border-gray-800 bg-gray-900 p-0 text-white sm:max-w-[800px]">
                    <div className="relative aspect-square w-full sm:aspect-video">
                      <Image src={photo.url || "/placeholder.svg"} alt={photo.title} fill className="object-contain" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{photo.title}</h3>
                      <p className="text-sm text-gray-400">
                        {photo.album} • {photo.uploadedDate}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline photos" className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredPhotos.map((photo) => (
                <Dialog key={photo.id}>
                  <DialogTrigger asChild>
                    <div
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-800 bg-gray-800"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      <div className="absolute bottom-0 left-0 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="text-xs font-medium text-white">{photo.album}</p>
                        <p className="text-xs text-gray-300">{photo.uploadedDate}</p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="border-gray-800 bg-gray-900 p-0 text-white sm:max-w-[800px]">
                    <div className="relative aspect-square w-full sm:aspect-video">
                      <Image src={photo.url || "/placeholder.svg"} alt={photo.title} fill className="object-contain" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{photo.title}</h3>
                      <p className="text-sm text-gray-400">
                        {photo.album} • {photo.uploadedDate}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

