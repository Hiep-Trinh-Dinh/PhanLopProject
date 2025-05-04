"use client"

import { useEffect, useState } from "react"
import MainLayout from "@/components/layout/main-layout"
import FriendsList from "@/components/friends/friends-list"
import FriendRequests from "@/components/friends/friend-requests"
import FriendSuggestions from "@/components/friends/friend-suggestions"
import UserSearch from "@/components/friends/user-search"

export default function FriendsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    
    // Check if friends list needs refreshing on component mount
    if (typeof window !== 'undefined') {
      const needsRefresh = window.localStorage.getItem('friends_list_needs_refresh');
      if (needsRefresh === 'true') {
        console.log('FriendsPage: Detected needs_refresh flag on mount, refreshing components');
        setRefreshKey(prev => prev + 1);
      }
    }
  }, [])
  
  const handleAddFriend = () => {
    console.log('FriendsPage: Friend added/accepted, refreshing components');
    setRefreshKey(prev => prev + 1)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('last_friends_update', Date.now().toString())
        // Ensure localStorage has the refresh flag set
        localStorage.setItem('friends_list_needs_refresh', 'true')
      } catch (error) {
        console.error("Lỗi khi lưu last_friends_update vào localStorage:", error)
      }
    }
  }
  
  useEffect(() => {
    if (!isClient) return;
    
    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'friendship_updated_at' || e.key === 'friends_list_needs_refresh') {
        console.log('FriendsPage: Detected storage change for friendship data, refreshing components');
        setRefreshKey(prev => prev + 1);
      }
    }
    
    const checkForUpdates = () => {
      try {
        const lastUpdate = localStorage.getItem('last_friends_update')
        const needsRefresh = localStorage.getItem('friends_list_needs_refresh')
        
        if ((lastUpdate && parseInt(lastUpdate) > Date.now() - 5000) || needsRefresh === 'true') {
          console.log('FriendsPage: Detected updates on window focus, refreshing components');
          setRefreshKey(prev => prev + 1)
        }
      } catch (error) {
        console.error("Lỗi khi đọc từ localStorage:", error)
      }
    }
    
    window.addEventListener('focus', checkForUpdates)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('focus', checkForUpdates)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isClient])
  
  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">Friends</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FriendRequests key={`requests-${refreshKey}`} onAccept={handleAddFriend} />
            <UserSearch key={`search-${refreshKey}`} onAddFriend={handleAddFriend} />
          </div>
          <FriendSuggestions key={`suggestions-${refreshKey}`} onAddFriend={handleAddFriend} />
        </div>

        <FriendsList key={`list-${refreshKey}`} />
      </div>
    </MainLayout>
  )
}

