import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


//this route authenticates the user, retrieves their info, sets them up with Liveblocks, and handles their presence in real time.

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  console.log(clerkUser);
  if (!clerkUser) redirect('/sign-in');

  const { id, firstName, lastName, emailAddresses, imageUrl } = clerkUser;

  // Get the current user from your database
  //constructs a user object
  const user = {
    id,
    info: {
      id,
      name: `${firstName} ${lastName}`,
      email: emailAddresses[0].emailAddress,
      avatar: imageUrl,
      color: getUserColor(id),
    }
  }

  // Identify the user and return the result
  const { status, body } = await liveblocks.identifyUser(
    //The liveblocks.identifyUser method is called to register the user in a Liveblocks room, allowing them to interact in real time.
    {
      userId: user.info.email,
      groupIds: [],
    },
    { userInfo: user.info },
  );

  return new Response(body, { status });
}
