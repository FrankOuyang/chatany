'use client'

import { Inbox } from "lucide-react"
import React from "react"
import { useDropzone } from "react-dropzone"

type Props = {}

const FileUpload = (props: Props) => {
    const { getRootProps, getInputProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] }, // accept only pdf files
        maxFiles: 1, // accept only one file
        onDrop: (acceptedFiles) => {
            console.log(acceptedFiles)
            const file = acceptedFiles[0]
            if (file.size > 10 * 1024 * 1024) {
                alert("File is too big! Please upload a file smaller than 10MB.")
                return
            }
        },
    })
    return (
        <div className="p-2 bg-white rounded-xl">
            <div>
                <div {...getRootProps({
                    className: "p-4 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer"
                })}>
                    <input {...getInputProps()} />
                    <>
                        <Inbox className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-slate-400 text-center text-gray-400">Drag & drop your PDF file here</p>
                    </>
                </div>
            </div>
        </div>
    )
}

export default FileUpload
