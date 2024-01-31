import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/app/libs/pusher';

interface IParams {
  conversationId?: string;
}

// DELETE API for deleting a conversation
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    if (!params.conversationId) {
      return new NextResponse('Conversation ID required', { status: 400 });
    }
    const existingConversation = await verifyConversationExists(params.conversationId);

    const currentUser = await verifyUser();

    const result = await deleteConversation(params.conversationId, currentUser.id);

    existingConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, 'conversation:remove', existingConversation);
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error.message, 'ERROR_CONVERSATION_DELETE');
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Invalid ID' ? 400 : 500;
    return new NextResponse(error.message, { status });
  }
}

/**
 * * Helper functions
 */
// Helper function to verify user
async function verifyUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    throw new Error('Unauthorized');
  }
  return currentUser;
}

// Helper function to find a conversation
async function verifyConversationExists(conversationId: string) {
  const existingConversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { users: true },
  });

  if (!existingConversation) {
    throw new Error('Invalid ID');
  }

  return existingConversation;
}

// Helper function to delete a conversation
async function deleteConversation(conversationId: string, userId: string) {
  return await prisma.conversation.deleteMany({
    where: {
      id: conversationId,
      userIds: {
        hasSome: [userId],
      },
    },
  });
}