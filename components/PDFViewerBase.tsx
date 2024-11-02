'use client';

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type Props = { pdf_path: string };

const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-2 text-gray-500 px-4 py-2 rounded-lg shadow-sm">
    <Loader2 className="w-5 h-5 animate-spin" />
    <span className="font-medium">Loading PDF...</span>
  </div>
);

const PDFViewerBase = ({ pdf_path }: Props) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [inputPage, setInputPage] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setLoading(false);
    setError(null);
    setNumPages(numPages);
  }

  function onDocumentLoadError(err: Error) {
    setLoading(false);
    console.error('PDF Load Error:', err);
    fetch(`/api/pdf/${encodeURIComponent(pdf_path)}`)
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Server returned ${response.status}: ${text}`);
          });
        }
        return response.blob();
      })
      .then(() => {
        setError(`PDF loaded but failed to render: ${err.message}`);
      })
      .catch(fetchError => {
        setError(`Server error: ${fetchError.message}`);
      });
  }

  const apiUrl = `/api/pdf/${encodeURIComponent(pdf_path)}`;

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage = parseInt(inputPage);
    if (newPage && newPage > 0 && newPage <= (numPages || 0)) {
      setPageNumber(newPage);
    } else {
      setInputPage(pageNumber.toString());
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* {loading && <LoadingSpinner />} */}
      
      {error && (
        <div className="text-red-500 p-4 border border-red-300 rounded-lg bg-white shadow-sm">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-2 text-gray-600">URL: {apiUrl}</p>
          <button 
            onClick={() => window.open(apiUrl, '_blank')}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Open in New Tab
          </button>
        </div>
      )}

      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
        <Document
          file={apiUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<LoadingSpinner />}
          className="flex justify-center"
        >
          {numPages && (
            <Page 
              pageNumber={pageNumber}
              loading={<LoadingSpinner />}
              className="max-w-full mx-auto"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          )}
        </Document>

        {numPages && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={numPages}
                value={inputPage}
                onChange={handlePageInput}
                onBlur={handlePageSubmit}
                className="w-16 px-2 py-1 text-sm border rounded-md text-center"
              />
              <span className="text-sm font-medium">
                of {numPages}
              </span>
            </form>
            
            <button
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || prev))}
              disabled={pageNumber >= (numPages || 0)}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewerBase;
