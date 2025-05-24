'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils';
import { Loader2, Mail } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['artist', 'manager']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      role: 'artist',
    },
  });

  const onSignIn = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (error) {
      // Error is already handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      await signUp(data.email, data.password, data.displayName, data.role);
    } catch (error) {
      // Error is already handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      // Error is already handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-zam-text-primary">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-zam-text-secondary">
          {isSignUp
            ? 'Start managing your music career today'
            : 'Sign in to continue to your dashboard'}
        </p>
      </div>

      <div className="card space-y-6">
        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full btn btn-outline h-11 space-x-3"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zam-border-primary" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zam-bg-card px-2 text-zam-text-tertiary">
              Or continue with
            </span>
          </div>
        </div>

        {/* Sign In Form */}
        {!isSignUp ? (
          <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                {...signInForm.register('email')}
                type="email"
                className="input mt-1.5"
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {signInForm.formState.errors.email && (
                <p className="mt-1 text-sm text-zam-accent-danger">
                  {signInForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                {...signInForm.register('password')}
                type="password"
                className="input mt-1.5"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {signInForm.formState.errors.password && (
                <p className="mt-1 text-sm text-zam-accent-danger">
                  {signInForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary h-11"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="label">
                Full Name
              </label>
              <input
                {...signUpForm.register('displayName')}
                type="text"
                className="input mt-1.5"
                placeholder="John Doe"
                disabled={isLoading}
              />
              {signUpForm.formState.errors.displayName && (
                <p className="mt-1 text-sm text-zam-accent-danger">
                  {signUpForm.formState.errors.displayName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                {...signUpForm.register('email')}
                type="email"
                className="input mt-1.5"
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {signUpForm.formState.errors.email && (
                <p className="mt-1 text-sm text-zam-accent-danger">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="label">
                I am a...
              </label>
              <select
                {...signUpForm.register('role')}
                className="input mt-1.5"
                disabled={isLoading}
              >
                <option value="artist">Artist</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                {...signUpForm.register('password')}
                type="password"
                className="input mt-1.5"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {signUpForm.formState.errors.password && (
                <p className="mt-1 text-sm text-zam-accent-danger">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <input
                {...signUpForm.register('confirmPassword')}
                type="password"
                className="input mt-1.5"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {signUpForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-zam-accent-danger">
                  {signUpForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary h-11"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-zam-text-secondary hover:text-zam-text-primary transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}