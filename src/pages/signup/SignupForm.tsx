// SignupForm.tsx
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { ValidatedInput } from '@/components/common/ValidateInput'
import { ErrorBanner } from '@/components/ErrorBanner'
import { cn } from '@/lib/utils'
import { authService } from '@/services/auth.service'
import { authStore } from '@/store/auth.store'
import {
  validateEmail,
  validateName,
  validatePassword,
} from '@/utils/validation/authValidation'

export default function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()

  const [emailValue, setEmailValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [nameValue, setNameValue] = useState('')

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [nameError, setNameError] = useState('')
  const [serverError, setServerError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateFields() {
    let valid = true

    const nameCheck = validateName(nameValue)
    setNameError(nameCheck.error)
    if (!nameCheck.valid) valid = false

    const emailCheck = validateEmail(emailValue)
    setEmailError(emailCheck.error)
    if (!emailCheck.valid) valid = false

    const passwordCheck = validatePassword(passwordValue)
    setPasswordError(passwordCheck.error)
    if (!passwordCheck.valid) valid = false

    return valid
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError('')

    if (!validateFields()) return

    setIsSubmitting(true)

    try {
      const response = await authService.signup({
        email: emailValue,
        password: passwordValue,
        name: nameValue,
      })

      authStore.getState().setAuthToken(response.data.accessToken)
      const profile = await authService.getMe()
      authStore.getState().setCurrentUser(profile.data.user)

      navigate('/chat')
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Signup failed. Try again.'

      if (message.includes('Email already registered')) {
        setServerError(message)
        setIsSubmitting(false)
        return
      }

      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSignup} noValidate>
        <ErrorBanner message={serverError} />
        <FieldGroup>
          <ValidatedInput
            id='name'
            label='Name'
            value={nameValue}
            error={nameError}
            placeholder='Prabanjan Jeyasankar'
            onChange={(value) => {
              setNameValue(value)
              setNameError('')
              setServerError('')
            }}
          />

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
              setServerError('')
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
              setServerError('')
            }}
          />

          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
