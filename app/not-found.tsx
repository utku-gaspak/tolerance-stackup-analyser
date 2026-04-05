
import Link from "next/link";



export default function NotFound() {

  return (

    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-6 py-16">

      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-700">

        404

      </p>

      <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">

        Page not found

      </h1>

      <p className="text-sm leading-6 text-neutral-700">

        The page you requested does not exist.

      </p>

      <Link

        href="/"

        className="border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"

      >

        Return home

      </Link>

    </main>

  );

}

