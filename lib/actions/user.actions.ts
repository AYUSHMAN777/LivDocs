'use server';

import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    const { data } = await clerkClient.users.getUserList({
      // userId: userIds,
      emailAddress: userIds,
    });
    // console.log(data);
    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0]?.emailAddress,
      avatar: user.imageUrl,
    }));
    // Sort the users based on the order of the provided userIds
    // const sortedUsers = userIds.map((id) => users.find((user) => user.id === id));
    const sortedUsers = userIds.map((email) => users.find((user) => user.email === email));

    return parseStringify(sortedUsers);
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
  }
}

export const getDocumentUsers = async ({ roomId, currentUser, text }: { roomId: string, currentUser: string, text: string }) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const users = Object.keys(room.usersAccesses).filter((email) => email !== currentUser);//get access to the users within the room

    if (text.length) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) => email.toLowerCase().includes(lowerCaseText))

      return parseStringify(filteredUsers);
    }

    return parseStringify(users);
  } catch (error) {
    console.log(`Error fetching document users: ${error}`);
  }
}