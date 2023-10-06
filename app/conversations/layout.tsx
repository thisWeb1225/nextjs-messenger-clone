import getConversations from '../actions/getConversations';
import Sidebar from '../components/sidebar/Sidebar';
import ConversationList from './components/ConversationList';

type ConversationsLayout = {
  children: React.ReactNode;
};

const ConversationsLayout: React.FC<ConversationsLayout> = async ({
  children,
}) => {
  const conversations = await getConversations();

  return (
    <Sidebar>
      <div className="h-full">
        <ConversationList initialItems={conversations} />
        {children}
      </div>
    </Sidebar>
  );
};

export default ConversationsLayout;
