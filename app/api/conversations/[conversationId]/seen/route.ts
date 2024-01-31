import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/app/libs/pusher';

// Type
import { User, Conversation } from '@prisma/client';

interface IParams {
  conversationId?: string;
}

/**
 * Handles the POST request to update the seen status of the last message in a conversation
 * @param request The incoming request object
 * @param params The request parameters containing the conversation ID
 */
export async function POST(request: Request, { params }: { params: IParams }) {
  try {
    const currentUser = await getCurrentUser();
    if (!isValidUser(currentUser)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const conversation = await getConversation(params.conversationId);
    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 400 });
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    const updatedMessage = await updateLastMessageSeen(lastMessage.id, currentUser!.id);

    await pusherServer.trigger(currentUser!.email!, 'conversation:update', {
      id: conversation.id,
      messages: [updatedMessage],
    });

    if (lastMessage.seenIds.indexOf(currentUser!.id) !== -1) {
      return NextResponse.json(conversation);
    }

    await pusherServer.trigger(conversation.id!, 'message:update', updatedMessage)

    return NextResponse.json(updatedMessage);
  } catch (error) {
    logError(error, 'ERROR_MESSAGES_SEEN');
    return new NextResponse('Internal Error', { status: 500 });
  }
}

function isValidUser(user: User | null): boolean {
  return !!(user && user.id && user.email);
}

// Helper functions for getting the conversation
async function getConversation(conversationId: string | undefined) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      messages: {
        include: {
          seen: true,
        },
      },
      users: true,
    },
  });

  return conversation;
}


async function updateLastMessageSeen(lastMessageId: string, userId: string) {
  const updatedMessage = await prisma.message.update({
    where: {
      id: lastMessageId,
    },
    data: {
      seen: {
        connect: {
          id: userId,
        },
      },
    },
    include: {
      seen: true,
      sender: true,
    },
  });

  return updatedMessage
}

function logError(error: any, context: string) {
  console.log(error, context);
}
