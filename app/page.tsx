import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { LogIn } from 'lucide-react'
import TypewriterEffect from "@/components/Typerwriter"
import FileUpload from "@/components/FileUpload"
import Navigation from "@/components/Navigation"
import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function Home() {
  const { userId } = await auth()
  const isAuth = !!userId

  let latestChatId: number | undefined
  if (userId) {
    const userChats = await db.select().from(chats).where(eq(chats.userId, userId))
    latestChatId = userChats.length > 0 ? userChats[userChats.length - 1].id : undefined
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-r from-rose-100 to-teal-100 dark:from-[#011627] dark:to-[#011627]">
      <Navigation isAuth={isAuth} />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center text-center p-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center whitespace-nowrap">
              <h1 className="mr-3 text-5xl font-extrabold">
                <TypewriterEffect />
              </h1>
            </div>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            ChatAny is an innovative AI application designed to enhance the way users interact with documents. 
            Upload any document and start a conversation with your content instantly.
          </p>

          <div className="w-full max-w-md mx-auto">
            {isAuth ? (
              <div className="space-y-4">
                <FileUpload />
                <Link href={latestChatId ? `/chat/${latestChatId}` : "/"} className="w-full">
                  <Button className="mt-4 w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 dark:from-[#5f7e97] dark:to-[#82AAFF] dark:hover:from-[#82AAFF] dark:hover:to-[#5f7e97]">
                    Start Chatting
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/sign-in" className="w-full">
                <Button className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 dark:from-[#5f7e97] dark:to-[#82AAFF] dark:hover:from-[#82AAFF] dark:hover:to-[#5f7e97]">
                  Get Started
                  <LogIn className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
