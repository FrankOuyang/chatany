'use client';

import React from "react";
import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const PDFViewer = dynamic(
  () => import('./PDFViewerBase'), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex flex-col items-center">
        <Card className="flex-1 w-full max-w-3xl p-4 space-y-4 relative">
          {/* PDF Page Skeleton */}
          <div className="flex justify-center">
            <Skeleton className="w-full h-full min-h-[700px] max-w-[600px] dark:bg-gray-800" />
          </div>

          {/* Controls Skeleton */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full dark:bg-gray-800" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-16 h-8 rounded-md dark:bg-gray-800" />
                <Skeleton className="w-20 h-6 dark:bg-gray-800" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full dark:bg-gray-800" />
            </div>
          </div>

          {/* Centered Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/80 dark:bg-gray-900/80 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium dark:text-gray-200">Loading PDF viewer...</span>
            </div>
          </div>
        </Card>
      </div>
    )
  }
);

export default PDFViewer;
