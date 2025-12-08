import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Coloring App</h1>
      <p className="text-xl mb-8">Scan a QR code to start coloring!</p>

      <div className="flex gap-4">
        <a href="/p/1" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Demo Page 1 (Castle)
        </a>
        <a href="/p/2" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Demo Page 2 (Space)
        </a>
      </div>

      <div className="mt-12 text-center">
        <a href="/admin" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          Go to Admin Dashboard
        </a>
      </div>
    </div>
  );
}
