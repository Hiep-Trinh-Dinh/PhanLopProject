"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostApi, PostDto } from '../lib/api';
import LoadingSpinner from '@/components/common/loading-spinner';

// Simplified version without dependent components
export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  useEffect(() => {
    if (query) {
      searchPosts();
    } else {
      setPosts([]);
      setLoading(false);
      setHasMore(false);
    }
  }, [query]);
  
  const searchPosts = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const currentPage = reset ? 0 : page;
      const result = await PostApi.searchPosts(query, currentPage);
      
      if (reset) {
        setPosts(result.content);
      } else {
        setPosts(prev => [...prev, ...result.content]);
      }
      
      setTotalResults(result.page.totalElements);
      setHasMore(currentPage < result.page.totalPages - 1);
      
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error("Error searching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    searchPosts(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-10">
      <h1 className="text-2xl font-bold text-white mb-6">
        Kết quả tìm kiếm cho "{query}"
      </h1>
      
      {loading ? (
        <div className="flex justify-center p-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="text-gray-400 mb-6">
            Tìm thấy {totalResults} kết quả
          </div>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                  <span className="text-white">{post.user.firstName} {post.user.lastName}</span>
                </div>
                <p className="text-white">{post.content}</p>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingMore ? 'Đang tải...' : 'Xem thêm'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-gray-400">
          <p className="text-xl mb-2">Không tìm thấy kết quả nào</p>
          <p>Hãy thử tìm kiếm với từ khóa khác</p>
        </div>
      )}
    </div>
  );
} 