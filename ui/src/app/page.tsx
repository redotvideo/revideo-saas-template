import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex items-center flex-col mx-auto justify-center mt-48 p-24 text-center max-w-4xl">
        <p className="text-grey-800 text-lg">
          Welcome to your example Revideo Saas! This simple project demonstrates
          how you can create an AI short video generator product with Revideo.
        </p>
        <Link href="/create">
          <button
            type="button"
            className="rounded-md mt-4 bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create a Video
          </button>
        </Link>
      </main>
    </>
  );
}
