import getConversationById from '@/app/actions/getConversationById';
import getMessages from '@/app/actions/getMessages';
import EmptyState from '@/app/components/EmptyState';
import Header from './components/Header';
import Body from './components/Body';
import Form from './components/Form';

interface Params {
  conversationId: string;
}

const page = async ({ params }: { params: Params }) => {
  const conversation = await getConversationById(params.conversationId);
  const message = await getMessages(params.conversationId);

  if (!conversation) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-80 h-full">
      <div className="h-full flex flex-col">
        <Header conversation={conversation} />
        <Body initialMessages={message} />
        <Form />
      </div>
    </div>
  );
};

export default page;
