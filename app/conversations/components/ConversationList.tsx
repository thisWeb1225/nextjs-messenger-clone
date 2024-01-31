'use client';
// Hooks & Actions
import useConversation from '@/app/hooks/useConversation';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
// Type
import { FullConversationType } from '@/app/types';
import { User } from '@prisma/client';
// Libs
import clsx from 'clsx';
import { pusherClient } from '@/app/libs/pusher';
// Components
import { MdOutlineGroup } from 'react-icons/md';
import ConversationBox from './ConversationBox';
import GroupChatModal from './GroupChatModal';

interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}

const ConversationList: React.FC<ConversationListProps> = ({
  initialItems,
  users,
}) => {
  const [items, setItems] = useState(initialItems);
  const { conversationId, isOpen } = useConversation();
  const [isModalOpen, setIsModalPen] = useState(false);

  const router = useRouter();
  const session = useSession();

  const pusherKey = session.data?.user?.email;

  useEffect(() => {
    if (!pusherKey) {
      return;
    }

    pusherClient.subscribe(pusherKey);

    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((currentConversation) => {
          if (currentConversation.id === conversation.id) {
            return {
              ...currentConversation,
              messages: conversation.messages,
            };
          }

          return currentConversation;
        })
      );
    };

    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        const existedItem = current.find((item) => {
          return item.id === conversation.id;
        });
        if (existedItem) return current;

        return [conversation, ...current];
      });
    };

    const removeHandler = (conversation: FullConversationType) => {
      // Remove conversation from list state
      setItems((current) => {
        return [...current.filter((conversationItem) => conversationItem.id !== conversation.id)];
      });

      // Redirect to conversations page
      if (conversationId === conversation.id) {
        router.push('/conversations');
      }
    };

    pusherClient.bind('conversation:update', updateHandler);
    pusherClient.bind('conversation:new', newHandler);
    pusherClient.bind('conversation:remove', removeHandler);
  }, [pusherKey, router]);

  return (
    <>
      <GroupChatModal
        users={users}
        isOpen={isModalOpen}
        onClose={() => setIsModalPen(false)}
      />
      <aside
        className={clsx(
          'fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200',
          isOpen ? 'hidden' : 'block w-full left-0'
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800">Message</div>
            <div
              onClick={() => setIsModalPen(true)}
              className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
            >
              <MdOutlineGroup />
            </div>
          </div>
          {items.map((item) => (
            <ConversationBox
              key={item.id}
              data={item}
              selected={conversationId === item.id}
            />
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
