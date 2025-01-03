import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import Navigation from "@/components/Navigation";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import ChatComponent from "@/components/ChatComponent";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  const fileKey = currentChat?.fileKey || "";
  const uploadsIndex = fileKey.indexOf("/uploads/");
  if (uploadsIndex === -1) {
    throw new Error("Invalid path: must contain /uploads/ directory");
  }
  const pdfPath = fileKey.slice(uploadsIndex + '/uploads/'.length);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-rose-100 to-teal-100 dark:from-[#011627] dark:to-[#011627]">
      <Navigation isAuth={!!userId} />
      <div className="flex-1 container mx-auto overflow-hidden">
        <div className="flex h-full">
          {/* chat sidebar */}
          <div className="flex-[1] max-w-xs overflow-y-auto">
            <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={true} />
          </div>
          {/* pdf viewer */}
          <div className="flex-[3] h-full">
            <div className="h-full px-4 py-8 overflow-hidden">
              <PDFViewer pdf_path={pdfPath} />
            </div>
          </div>
          {/* chat component */}
          <div className="flex-[3] overflow-y-auto">
            <ChatComponent chatId={parseInt(chatId)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
