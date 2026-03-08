import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileText, Mail } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <FileText className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">PA RTK</span>
      </Link>
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Click the link in your email to verify your account. Once confirmed,
              you&apos;ll be able to log in and start filing RTK requests.
            </p>
            <div className="mt-6 text-center text-sm">
              <Link
                href="/auth/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
