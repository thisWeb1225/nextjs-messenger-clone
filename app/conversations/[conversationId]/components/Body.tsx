'use client';

// Hooks
import useConversation from '@/app/hooks/useConversation';
import { useEffect, useRef, useState } from 'react';
// Types
import { FullMessageType } from '@/app/types';
// Components
import MessageBox from './MessageBox';
import axios from 'axios';

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: React.FC<BodyProps> = ({ initialMessages }) => {
  const [messages, setMessage] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <MessageBox
          isLast={index === messages.length - 1}
          key={message.id}
          data={message}
        />
      ))}
      <div ref={bottomRef} className="pt-24"></div>
    </div>
  );
};

export default Body;
