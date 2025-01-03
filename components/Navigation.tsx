import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { LogIn } from 'lucide-react'
import { ModeToggle } from "./ThemeToggle"

export default function Navigation({ isAuth }: { isAuth: boolean }) {
  return (
    <div className="container mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">
          ChatAny
        </Link>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
          {isAuth ? (
            <UserButton />
          ) : (
            <Link href="/sign-in" className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500 hover:from-green-500 hover:to-purple-600">
              <LogIn className="w-5 h-5 text-green-400" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
