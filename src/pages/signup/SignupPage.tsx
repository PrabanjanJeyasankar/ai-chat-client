import { AuthLayout } from '@/layouts/AuthLayout'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <AuthLayout
      title='Trace Welcomes You!'
      description={
        <>
          Already have an account? <a href='/login'>Sign in</a>
        </>
      }>
      <SignupForm />
    </AuthLayout>
  )
}
