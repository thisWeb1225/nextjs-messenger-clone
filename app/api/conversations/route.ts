import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';


/**
 * Handle POST request to create a new conversation or retrieve an existing one.
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - The response to the request.
 */

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { userId, isGroup, members, name } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    // Create a new group conversation
    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      return NextResponse.json(newConversation);
    }

    // Retrieve an existing conversation
    const existingConversation = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    const singleConversation = existingConversation[0];

    // Return the existing conversation if found
    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    // if no conversation is found, create a new one
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
    });

    return NextResponse.json(newConversation);
  } catch (error: any) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
