'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { useTrading } from '../../lib/contexts/TradingContext'

interface LoginForm {
  email: string
  password: string
}

interface OTPForm {
  otp: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'login' | 'otp'>('login')
  const [email, setEmail] = useState('')
  const { signIn, user, loading } = useTrading()
  const router = useRouter()

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginForm>()
  const { register: registerOTP, handleSubmit: handleOTPSubmit, formState: { errors: otpErrors } } = useForm<OTPForm>()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const onLoginSubmit = async (data: LoginForm) => {
    // Simulate email/password check
    setEmail(data.email)
    setStep('otp')
    toast.success('Email verified! Please enter your OTP.')
  }

  const onOTPSubmit = async (data: OTPForm) => {
    if (data.otp === '123456') {
      // Simulate successful OTP verification
      const { error } = await signIn(email, 'demo-password')

      if (error) {
        toast.error('Authentication failed')
      } else {
        toast.success('2FA verified! Access granted.')
        router.push('/dashboard')
      }
    } else {
      toast.error('Invalid OTP. Use 123456 for demo.')
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if already authenticated
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-white">Tradelia</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Access Research Platform
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Private access required for AI trading tools
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
          {step === 'login' ? (
            <>
              {/* Security indicator */}
              <div className="flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-green-400 mr-2" />
                <span className="text-white font-medium">Secure 2FA Authentication</span>
              </div>

              <form className="space-y-6" onSubmit={handleLoginSubmit(onLoginSubmit)}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      {...registerLogin('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      autoComplete="email"
                      className="input-field bg-white/20 text-white placeholder-gray-300 border-white/30"
                      placeholder="Enter your email"
                    />
                    {loginErrors.email && (
                      <p className="mt-1 text-sm text-red-400">{loginErrors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...registerLogin('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="input-field bg-white/20 text-white placeholder-gray-300 border-white/30 pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-300" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                    {loginErrors.password && (
                      <p className="mt-1 text-sm text-red-400">{loginErrors.password.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Continue to 2FA'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* OTP Step */}
              <div className="flex items-center justify-center mb-6">
                <DevicePhoneMobileIcon className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-white font-medium">Two-Factor Authentication</span>
              </div>

              <p className="text-center text-gray-300 mb-6">
                We've sent a verification code to your email.<br />
                Enter the 6-digit code below.
              </p>

              <form className="space-y-6" onSubmit={handleOTPSubmit(onOTPSubmit)}>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-white text-center">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      {...registerOTP('otp', {
                        required: 'OTP is required',
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'OTP must be 6 digits'
                        }
                      })}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="input-field bg-white/20 text-white placeholder-gray-300 border-white/30 text-center text-2xl tracking-widest"
                      placeholder="000000"
                    />
                    {otpErrors.otp && (
                      <p className="mt-1 text-sm text-red-400 text-center">{otpErrors.otp.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify & Access'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    ← Back to login
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Demo OTP: 123456
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
