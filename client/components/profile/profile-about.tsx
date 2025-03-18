"use client"

import { Briefcase, GraduationCap, Heart, Home, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileAboutProps {
  userId: number
}

export default function ProfileAbout({ userId }: ProfileAboutProps) {
  // In a real app, you would fetch this data from an API
  const aboutInfo = {
    overview: {
      work: [
        {
          id: 1,
          position: "Senior Frontend Developer",
          company: "Tech Innovations Inc.",
          current: true,
          startYear: 2020,
          endYear: null,
        },
        {
          id: 2,
          position: "Web Developer",
          company: "Digital Solutions",
          current: false,
          startYear: 2018,
          endYear: 2020,
        },
      ],
      education: [
        {
          id: 1,
          school: "University of Technology",
          degree: "Bachelor of Computer Science",
          startYear: 2014,
          endYear: 2018,
        },
      ],
      currentCity: "San Francisco, California",
      hometown: "Portland, Oregon",
      relationship: "Single",
    },
    contactInfo: {
      email: "johndoe@example.com",
      phone: "+1 (555) 123-4567",
      website: "https://johndoe.dev",
    },
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Work</h3>
              {aboutInfo.overview.work.map((job) => (
                <div key={job.id} className="flex items-start space-x-3">
                  <Briefcase className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-white">
                      {job.position} at {job.company}
                    </p>
                    <p className="text-sm text-gray-400">
                      {job.startYear} - {job.current ? "Present" : job.endYear}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Education</h3>
              {aboutInfo.overview.education.map((edu) => (
                <div key={edu.id} className="flex items-start space-x-3">
                  <GraduationCap className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-white">
                      {edu.degree} from {edu.school}
                    </p>
                    <p className="text-sm text-gray-400">
                      {edu.startYear} - {edu.endYear}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Places</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-white">Lives in {aboutInfo.overview.currentCity}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Home className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-white">From {aboutInfo.overview.hometown}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Relationship</h3>
              <div className="flex items-start space-x-3">
                <Heart className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-white">{aboutInfo.overview.relationship}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="font-medium text-white">{aboutInfo.contactInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phone</span>
              <span className="font-medium text-white">{aboutInfo.contactInfo.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Website</span>
              <a
                href={aboutInfo.contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-400 hover:underline"
              >
                {aboutInfo.contactInfo.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

