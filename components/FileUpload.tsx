'use client'

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Inbox, AlertCircle, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { saveFile } from "@/lib/localStorage"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

const FileUpload: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFileName(file.name)
      setUploadStatus('uploading')
      setUploadProgress(0)
      setErrorMessage(null)

      if (file.size > MAX_FILE_SIZE) {
        setUploadStatus('error')
        setErrorMessage('File size exceeds 10MB limit. Please choose a smaller file.')
        return
      }

      try {
        const formData = new FormData()
        formData.append('file', file)

        const result = await saveFile(formData)

        if (result.error) {
          throw new Error(result.error)
        }

        setUploadStatus('success')
      } catch (error) {
        console.error('Error uploading file:', error)
        setUploadStatus('error')
        setErrorMessage('Failed to upload file to the server. Please try again.')
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop,
  })

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <div
        {...getRootProps({
          className: `p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
          }`,
        })}
      >
        <input {...getInputProps()} />
        <Inbox className="w-16 h-16 mx-auto text-gray-400" />
        <p className="mt-4 text-sm text-center text-gray-500">
          {isDragActive
            ? "Drop your PDF file here"
            : "Drag & drop your PDF file here, or click to select"}
        </p>
        <p className="mt-2 text-xs text-center text-gray-400">
          (Only PDF files up to 10MB are accepted)
        </p>
      </div>

      {uploadStatus === 'uploading' && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="mt-2 text-sm text-center text-gray-500">
            Uploading: {uploadProgress.toFixed(0)}%
          </p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <Alert variant="default" className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            File "{fileName}" has been successfully uploaded to the server.
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus === 'error' && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMessage || 'An unexpected error occurred. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default FileUpload
