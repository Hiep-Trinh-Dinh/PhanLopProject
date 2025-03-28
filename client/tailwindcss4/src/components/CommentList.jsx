import { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';

export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentService.getCommentsByPost(postId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [postId]);

  return (
    
  );
}
