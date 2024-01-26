'use client';

// Hooks
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useOtherUser from '@/app/hooks/useOtherUser';
import { useSession } from 'next-auth/react';
// Libs
import { format } from 'date-fns';
import clsx from 'clsx';
// Types
import { FullConversationType } from '@/app/types';
// Components
import Avatar from '@/app/components/Avatar';

interface ConversationBoxProps {
  data: FullConversationType;
  selected?: boolean;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({
  data,
  selected,
}) => {
  const otherUser = useOtherUser(data);
  const session = useSession();
  const router = useRouter();

  const jumpToConversationPage = () => {
    router.push(`/conversations/${data.id}`);
  };

  const lastMessage = data.messages[data.messages.length - 1] || [];

  const userEmail = session.data?.user?.email;

  const hasSeen = useMemo(() => {
    if (!lastMessage) {
      return false;
    }

    // safety by empty array
    const seenArray = lastMessage.seen || [];

    if (!userEmail) {
      return false;
    }

    // the users who seen the message. if nobody seen, return false
    return seenArray.filter((user) => user.email === userEmail).length === 0;
  }, [userEmail, lastMessage]);

  const lastMessageText = (function () {
    if (lastMessage?.image) {
      return 'Sent an image';
    }

    if (lastMessage?.body) {
      return lastMessage.body;
    }

    // The conversation has not yet started
    return 'Started a conversation';
  })();

  return (
    <div
      onClick={jumpToConversationPage}
      className={clsx(
        `w-full relative flex items-center space-x-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer p-3`,
        selected ? 'bg-neutral-100' : 'bg-white'
      )}
    >
      <Avatar user={otherUser} />
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex justify-between items-center mb-1">
            <p className="text-md font-medium text-gray-900">
              {data.name || otherUser.name}
            </p>
            {lastMessage?.createdAt && (
              <p className="text-xs text-gray-400 font-light">
                {format(new Date(lastMessage.createdAt), 'p')}
              </p>
            )}
          </div>
          <p
            className={clsx(
              'truncate text-sm',
              hasSeen ? 'text-gray-500' : 'text-black font-medium'
            )}
          >
            {lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
