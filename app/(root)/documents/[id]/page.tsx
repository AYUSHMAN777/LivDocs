import CollaborativeRoom from "@/components/CollaborativeRoom"
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();  //Retrieves the current authenticated user using Clerk
  if(!clerkUser) redirect('/sign-in');

  const room = await getDocument({   //Fetches the document details based on roomId and userId
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if(!room) redirect('/');

  const userIds = Object.keys(room.usersAccesses);  //Retrieves the list of user IDs who have access to the room.
  const users = await getClerkUsers({ userIds });   //Fetches user details from Clerk based on user IDs

  const usersData = users.map((user: User) => ({
    ...user,
    userType: room.usersAccesses[user.email]?.includes('room:write')
      ? 'editor'
      : 'viewer'
  }))

  const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  )
}

export default Document