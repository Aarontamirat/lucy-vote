import Link from "next/link";
export default function AccessDeniedPage() {
  return <main className="mx-auto max-w-lg p-12 text-center"><h1 className="text-2xl font-bold">Access denied</h1><p className="my-4">Your account does not have permission to access this page. Contact your Super Admin if you need access.</p><Link className="underline" href="/">Return home</Link></main>;
}
