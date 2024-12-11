'use client';
import { createDocument } from '@/lib/actions/room.actions';
import { Button } from './ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
const AddDocumentBtn = ({ userId, email }: AddDocumentBtnProps) => {
    const router = useRouter();

    //This button component initiates the creation of a new document in Liveblocks for a specific user.
    const addDocumentHandler = async () => {
        try {
            const room = await createDocument({ userId, email });
       
            if (room) {
                // console.log("Redirecting to room:", room.id); 
                router.push(`/documents/${room.id}`);
              
            }
        } catch (error) {
            console.error("Error while creating document:", error);
        }
    }
    return (
        <Button type="submit" onClick={addDocumentHandler} className="gradient-blue flex gap-1 shadow-md">
            <Image
                src="/assets/icons/add.svg" alt="add" width={24} height={24}
            />
            <p className="hidden sm:block">Start a blank document</p>
        </Button>
    )
}

export default AddDocumentBtn