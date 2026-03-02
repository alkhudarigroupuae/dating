import Link from 'next/link';
import { User, MessageCircle, Heart } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <nav className="flex justify-around items-center p-4 bg-gray-900 border-t border-gray-800">
        <Link href="/matches" className="flex flex-col items-center text-gray-400 hover:text-primary">
          <Heart />
          <span className="text-xs mt-1">Matches</span>
        </Link>
        <Link href="/messages" className="flex flex-col items-center text-gray-400 hover:text-primary">
          <MessageCircle />
          <span className="text-xs mt-1">Chat</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-primary">
          <User />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
