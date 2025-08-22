import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <h1 className="text-3xl font-bold mb-4">Confirm your email</h1>
        <p className="text-gray-600">
            We’ve sent a confirmation link to your email. <br />
            Please check your inbox and click the link to complete registration.
        </p>
        <Link href={'/login'} className="mt-3 underline underline-offset-2">
            Go back to login page
        </Link>
    </div>
  )
}
