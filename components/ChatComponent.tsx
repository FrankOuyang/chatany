'use client';

import React, { useState } from 'react';
import { Input } from './ui/input';
import { useChat } from 'ai/react';
import { Button } from './ui/button';
import { SendIcon } from 'lucide-react';
import MessageList from './MessageList';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from './ui/dropdown-menu';
import { AVAILABLE_MODELS, type Model } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Message } from 'ai';

type Props = {
  chatId: number;
}

const ChatComponent = ({ chatId }: Props) => {
  const [selectedModel, setSelectedModel] = useState<Model>(AVAILABLE_MODELS[0]); // Default to the first model

  const { data, isLoading } = useQuery({
    queryKey: ["chat-history", chatId],
    queryFn: async () => {
      const response = await axios.get<Message[]>(`/api/chat/${chatId}/history`);
      return response.data;
    }
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: '/api/chat',
    body: {
      chatId,
      model: selectedModel.id,
    },
    initialMessages: data || []
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div className='relative h-full flex flex-col'>
        {/* chat messages */}
        <div className="flex-1 px-4 overflow-scroll" id="message-container">
            {messages.length === 0 && !isLoading ? (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="mb-8">
                            {/* <img src="/copilot-icon.png" alt="Copilot Icon" className="w-16 h-16 mx-auto mb-4" /> */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-20 h-20 mx-auto mb-4 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                            >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                                <circle cx="12" cy="12" r="0.7" fill="currentColor"/>
                                <circle cx="16" cy="12" r="0.7" fill="currentColor"/>
                                <circle cx="8" cy="12" r="0.7" fill="currentColor"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Chat Any</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                            ChatAny is powered by AI, so mistakes are possible. Review output carefully before use.
                        </p>
                        <div className="mt-6 space-y-2 text-sm text-gray-500 dark:text-gray-400 hidden">
                            <p className="flex items-center justify-center gap-2">
                                <span className="font-mono">📎</span> or type # to attach context
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                <span className="font-mono">@</span> to chat with extensions
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                Type <span className="font-mono">/</span> to use commands
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <MessageList messages={messages} isLoading={isLoading} />
            )}
        </div>
        {/* chat input */}
        <form onSubmit={handleSubmit} className='sticky bottom-0 p-5'>
            <div className='flex'>
                <div className="flex-1 relative">
                    <div className="relative">
                        <Input 
                            value={input} 
                            onChange={handleInputChange} 
                            placeholder='Ask any question...' 
                            className='w-full bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 px-6 py-4 pr-32'
                            autoFocus
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="bg-transparent text-sm text-gray-500 dark:text-gray-400 cursor-pointer focus:outline-none hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1">
                                {selectedModel.name}
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[200px]">
                                {AVAILABLE_MODELS.map((model) => (
                                  <DropdownMenuItem
                                    key={model.id}
                                    onClick={() => setSelectedModel(model)}
                                    disabled={!model.available}
                                    className={`flex flex-col items-start ${!model.available ? 'opacity-50' : ''}`}
                                  >
                                    <span className="font-medium">{model.name}</span>
                                    {model.description && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {model.description}
                                      </span>
                                    )}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
                <Button type='submit' className='ml-2'>
                    <SendIcon className='w-4 h-4'/>
                </Button>
            </div>
        </form>
    </div>
  );
};

export default ChatComponent;