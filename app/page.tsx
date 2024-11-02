import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { LogIn } from 'lucide-react'
import TypewriterEffect from "@/components/Typerwriter"
// import Typewriter from "@/components/Typerwriter-demo"
import FileUpload from "@/components/FileUpload"

export default async function Home() {
  const { userId } = await auth()
  const isAuth = !!userId

  return (
    <div className="w-full min-h-screen min-h-screen bg-gradient-to-r from-cyan-200 to-cyan-400">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center text-center p-4">
          <div className="flex items-center mb-4">
            <h1 className="mr-3 text-5xl font-semibold">Let&rsquo;s</h1>
            <UserButton />
          </div>
          <div className="flex items-center whitespace-nowrap">
            <h1 className="mr-3 text-5xl font-extrabold">
              {/* <Typewriter text="Chat with any doc" speed={150} pauseDuration={5000} /> */}
              < TypewriterEffect />
              {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">Spreadsheet Formulas</span> */}
            </h1>
          </div>

          <div className="flex mt-4 mb-4">
            {isAuth && <Button>Click to chat</Button>}
          </div>

          <p className="max-w-xl text-lg text-slate-600 mb-4">
            ChatAny is an innovative AI application designed to enhance the way users interact with documents.
          </p>
          {/* ChatPDF enables users to engage in conversational interactions with their PDF files, making document exploration, information retrieval, and comprehension more intuitive and efficient. */}

          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
