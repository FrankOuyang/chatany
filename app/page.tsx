import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { LogIn} from 'lucide-react'

export default async function Home() {
  const { userId } = await auth()
  const isAuth = !!userId

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-cyan-200 to-cyan-400">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Let&rsquo;s Chat with any PDF</h1>
            <UserButton />
          </div>

          <div className="flex mt-3">
            {isAuth && <Button>Chat with PDF</Button>}
          </div>

          <p className="max-w-xl mt-1 text-lg text-slate-600">
            ChatPDF is an innovative AI application designed to enhance the way users interact with PDF documents.
            ChatPDF enables users to engage in conversational interactions with their PDF files, making document exploration, information retrieval, and comprehension more intuitive and efficient.
          </p>

          <div className="w-full mt-4">
            {isAuth ? (
              <h1>fileupload</h1>
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login
                  <LogIn className="w-4 h-4 ml-2"/>
                </Button>
              </Link>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
