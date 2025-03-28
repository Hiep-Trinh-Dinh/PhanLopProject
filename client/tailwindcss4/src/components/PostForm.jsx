import { useState } from 'react';
import { postService } from '../services/postService';

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const newPost = await postService.createPost({ content });
      onPostCreated(newPost); // Cập nhật danh sách bài viết
      setContent(''); // Reset form
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    
  );
}
