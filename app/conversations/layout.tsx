// Actions
import getConversations from '../actions/getConversations';
import getUsers from '../actions/getUsers';
// Components
import Sidebar from '../components/sidebar/Sidebar';
import ConversationList from './components/ConversationList';

type ConversationsLayout = {
  children: React.ReactNode;
};

const ConversationsLayout: React.FC<ConversationsLayout> = async ({
  children,
}) => {
  const conversations = await getConversations();
  const users = await getUsers();

  return (
    <Sidebar>
      <div className="h-full">
        <ConversationList initialItems={conversations} users={users} />
        {children}
      </div>
    </Sidebar>
  );
};

export default ConversationsLayout;
