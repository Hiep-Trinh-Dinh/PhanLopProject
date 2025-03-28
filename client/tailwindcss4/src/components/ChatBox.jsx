import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';

export default function ChatBox({ chatId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await chatService.getMessages(chatId);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = { senderId: currentUser.id, content: newMessage };
      const sentMessage = await chatService.sendMessage(chatId, messageData);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    
  );
}
