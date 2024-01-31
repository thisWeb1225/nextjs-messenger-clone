'use client';

// Hooks
import useConversation from '@/app/hooks/useConversation';
import { useEffect, useRef, useState } from 'react';
// Types
import { FullMessageType } from '@/app/types';
// Components
import MessageBox from './MessageBox';
import axios from 'axios';
import { pusherClient } from '@/app/libs/pusher';

interface BodyProps {
  initialMessages: FullMessageType[];
}

function updateSeenStatus(conversationId: string) {
  axios.post(`/api/conversations/${conversationId}/seen`);
}

const Body: React.FC<BodyProps> = ({ initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  useEffect(() => updateSeenStatus(conversationId), [conversationId]);

  useEffect(() => {
    const channel = pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler =(message: FullMessageType) => {
      updateSeenStatus(conversationId);

      setMessages((currents) => {
        const existedMessage = currents.find((current) => {
          return current.id === message.id;
        });

        if (existedMessage) return currents;

        return [...currents, message];
      });

      bottomRef?.current?.scrollIntoView();
    }

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }

          return currentMessage;
        })
      );
    }

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
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
