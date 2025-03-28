import { useState, useEffect } from 'react';
import { postService } from '../services/postService';

export default function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await postService.getAllPosts();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="p-4 border rounded shadow bg-white">
              <h2 className="font-semibold text-lg">{post.title}</h2>
              <p className="text-gray-600">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
}
