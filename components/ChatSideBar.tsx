"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
// import axios from "axios";
// import SubscriptionButton from "./SubscriptionButton";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);

  // This function extracts the name of the PDF from the chat name
  const formatPdfName = (pdfName: string) => {
    const match = pdfName.match(/-(.+)$/);
    return match ? match[1] : pdfName;
  };

  return (
    <div className="flex flex-col h-full p-4">
      <Link href="/">
        <Button 
          variant="default" 
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-5 w-5 animate-pulse" />
          New Conversation
        </Button>
      </Link>

      <div className="flex-1 flex flex-col gap-3 mt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 px-1">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn(
                "rounded-lg p-3.5 text-sm flex items-center transition-all duration-300 hover:scale-[1.02] border",
                {
                  "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-transparent": chat.id === chatId,
                  "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md border-gray-200 dark:border-gray-700": chat.id !== chatId,
                }
              )}
            >
              <MessageCircle className={cn(
                "mr-3 w-5 h-5 transition-colors",
                chat.id === chatId ? "text-white" : "text-blue-500"
              )} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {formatPdfName(chat.pdfName)}
                </p>
                <p className="text-xs opacity-70 truncate">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 hidden">
        <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
        <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Source</Link>
      </div>
    </div>
  );
};

export default ChatSideBar;
