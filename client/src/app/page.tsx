import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-primary to-black text-white">
      <h1 className="text-6xl font-bold mb-8">LoveConnect</h1>
      <p className="text-xl mb-12">Find your soulmate today.</p>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-3 bg-white text-primary rounded-full font-bold">
          Login
        </Link>
        <Link href="/register" className="px-6 py-3 border border-white rounded-full font-bold">
          Register
        </Link>
      </div>
    </main>
  )
}
