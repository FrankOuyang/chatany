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
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-4xl p-4 space-y-4 relative">
          {/* PDF Page Skeleton */}
          <div className="flex justify-center">
            <Skeleton className="w-[600px] h-[800px]" />
          </div>

          {/* Controls Skeleton */}
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-8 rounded-md" />
              <Skeleton className="w-20 h-6" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>

          {/* Centered Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/80 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Loading PDF viewer...</span>
            </div>
          </div>
        </Card>
      </div>
    )
  }
);

export default PDFViewer;
