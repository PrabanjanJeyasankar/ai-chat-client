import { ValidatedInput } from '@/components/common/ValidateInput'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { authClient } from '@/domain/auth/auth.client'
import { useAuthStore } from '@/domain/auth/auth.store'
import { cn } from '@/lib/utils'
import {
  validateEmail,
  validatePassword,
} from '@/utils/validation/authValidation'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()

  const [emailValue, setEmailValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [serverError, setServerError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateFields() {
    let valid = true

    const emailCheck = validateEmail(emailValue)
    setEmailError(emailCheck.error)
    if (!emailCheck.valid) valid = false

    const passwordCheck = validatePassword(passwordValue)
    setPasswordError(passwordCheck.error)
    if (!passwordCheck.valid) valid = false

    return valid
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError('')

    if (!validateFields()) return

    setIsSubmitting(true)

    try {
      await authClient.login({
        email: emailValue,
        password: passwordValue,
      })

      const profile = await authClient.getProfile()
      useAuthStore.getState().setCurrentUser(profile.data.user)

      navigate('/chat')
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Login failed. Try again.'
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleLogin} noValidate>
        <ErrorBanner message={serverError} />
        <FieldGroup>
          <ValidatedInput
            id='email'
            label='Email'
            type='email'
            value={emailValue}
            error={emailError}
            placeholder='prabanjanjeyasankar@gmail.com'
            onChange={(value) => {
              setEmailValue(value)
              setEmailError('')
            }}
          />

          <ValidatedInput
            id='password'
            label='Password'
            type='password'
            value={passwordValue}
            error={passwordError}
            placeholder='••••••'
            onChange={(value) => {
              setPasswordValue(value)
              setPasswordError('')
            }}
          />

          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
