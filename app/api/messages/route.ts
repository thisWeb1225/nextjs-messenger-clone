import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { pusherServer } from '@/app/libs/pusher';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { message, image, conversationId } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image: image,
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        sender: {
          connect: {
            id: currentUser.id,
          },
        },
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
      include: {
        seen: true,
        sender: true,
      },
    });

    const updateConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    // pusherServer for realtime
    await pusherServer
      .trigger(conversationId, 'messages:new', newMessage)
      .catch((error) => {
        console.error(
          'ERROR_MESSAGES : PusherServer Error in api/messages',
          error
        );
      });

    const lastMessage =
      updateConversation.messages[updateConversation.messages.length - 1];

    updateConversation.users.forEach((user) => {
      pusherServer
        .trigger(user.email!, 'conversation:update', {
          id: conversationId,
          messages: [lastMessage],
        })
        .catch((error) => {
          console.error(
            'ERROR_MESSAGES : PusherServer Error in api/messages',
            error
          );
        });
    });

    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('InternalError', { status: 500 });
  }
}
