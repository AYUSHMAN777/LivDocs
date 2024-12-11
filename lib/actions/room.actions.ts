'use server';

import { nanoid } from 'nanoid'
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';
import { todo } from 'node:test';

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: 'Untitled'
    }

    const usersAccesses: RoomAccesses = {
      [email]: ['room:write']
    }

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: []
    });
    
    revalidatePath('/');

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while creating a room: ${error}`);
  }
}

export const getDocument = async ({ roomId, userId }: { roomId: string; userId: string }) => {//This function is structured to fetch a room and check user access
  try {
    
      const room = await liveblocks.getRoom(roomId);
      // console.log("Room data:", roomId);
      // console.log(userId);
      // console.log("Room Users Access Keys:", Object.keys(room.usersAccesses));
      

      //TODO: bring this back later on
      const hasAccess = Object.keys(room.usersAccesses).includes(userId);//looking into the access of user we are inviting
    
      if(!hasAccess) {
        throw new Error('You do not have access to this document');
      }
    
      return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while getting a room: ${error}`);
  }
}

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title
      }
    })

    revalidatePath(`/documents/${roomId}`);

    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while updating a room: ${error}`);
  }
}

export const getDocuments = async (email: string ) => {
  try {
      const rooms = await liveblocks.getRooms({ userId: email });
    
      return parseStringify(rooms);
  } catch (error) {
    console.log(`Error happened while getting rooms: ${error}`);
  }
}

export const updateDocumentAccess = async ({ roomId, email, userType, updatedBy }: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,//contain the list of all user accesses
    }

    const room = await liveblocks.updateRoom(roomId, { 
      usersAccesses
    })

    if(room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email
        },
        roomId
      })
    }

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating a room access: ${error}`);
  }
}

export const removeCollaborator = async ({ roomId, email }: {roomId: string, email: string}) => {
  try {
    const room = await liveblocks.getRoom(roomId)

    if(room.metadata.email === email) {
      throw new Error('You cannot remove yourself from the document');
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null           //removing the accesses of user by removing it's email 
      }
    })

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
}

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath('/');
    redirect('/');
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
}