import { useState, useEffect } from 'react';
import { friendService } from '../services/friendService';

export default function FriendRequests({ userId }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await friendService.getFriendRequests(userId);
        setRequests(data);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };
    fetchRequests();
  }, [userId]);

  const handleAccept = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      setRequests(requests.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      setRequests(requests.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  return (
    
  );
}
