"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface PostContextType {
  triggerRefresh: () => void;
  refreshFlag: boolean;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshFlag(prev => !prev);
  }, []);

  return (
    <PostContext.Provider value={{ triggerRefresh, refreshFlag }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePostContext() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
} 