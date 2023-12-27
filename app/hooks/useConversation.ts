import { useParams } from 'next/navigation';

const useConversation = () => {
  const params = useParams();

  const conversationId = params.conversationId
    ? (params.conversationId as string)
    : '';

  const isOpen = !!conversationId;

  return {
    isOpen,
    conversationId,
  };
};

export default useConversation;
