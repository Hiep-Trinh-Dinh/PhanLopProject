"use client"

import type React from "react"
import { useState } from "react"
import { Plus } from "lucide-react"

export default function CreateGroupButton() {
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [privacy, setPrivacy] = useState("public")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating group:", { groupName, groupDescription, privacy })
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setGroupName("")
    setGroupDescription("")
    setPrivacy("public")
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Plus className="mr-1 h-4 w-4" />
        Create Group
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[500px] rounded-lg border border-gray-800 bg-gray-900 p-6 text-white">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Create New Group</h2>
              <p className="text-sm text-gray-400">
                Create a group to connect with people who share your interests.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="group-name" className="text-sm font-medium">
                    Group Name
                  </label>
                  <input
                    id="group-name"
                    placeholder="Enter group name"
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="group-description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="group-description"
                    placeholder="What's your group about?"
                    className="min-h-[100px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="privacy" className="text-sm font-medium">
                    Privacy
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <p className="text-xs text-gray-400">
                    {privacy === "public"
                      ? "Anyone can see who's in the group and what they post."
                      : "Only members can see who's in the group and what they post."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-700 px-4 py-2 hover:bg-gray-800 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                  disabled={!groupName.trim()}
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

