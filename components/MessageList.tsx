import React from 'react';
import { Message } from 'ai';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    messages: Message[]
    isLoading: boolean
}

const MessageList = ({messages, isLoading}: Props) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Button disabled>
          <Loader2 className="animate-spin" />
          Loading messages...
        </Button>
      </div>
    );
  };
  if (!messages.length) return <></>;
  return (
    <div className='flex flex-col gap-4 px-4 py-2'>
        {messages.map(message => {
            return (
                <div key={message.id}
                className={cn('flex', {
                    'justify-start pr-10': message.role === 'user',
                    'justify-end pl-10': message.role === 'assistant',
                })}
                >
                    <div className={cn(
                        'rounded-2xl px-4 py-2 text-sm shadow-lg ring-1',
                        {
                            'bg-blue-500 text-white ring-blue-400': message.role === 'user',
                            'bg-gray-100 dark:bg-gray-800 ring-gray-200 dark:ring-gray-700': message.role === 'assistant'
                        }
                    )}>
                        <p className='leading-relaxed whitespace-pre-wrap'>{message.content}</p>
                    </div>
                </div>
            )
        })}
    </div>
  )
};

export default MessageList;