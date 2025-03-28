import { useState, useEffect } from 'react';
import { friendService } from '../services/friendService';

export default function FriendList({ userId }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await friendService.getFriends(userId);
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    fetchFriends();
  }, [userId]);

  return (
    
  );
}
