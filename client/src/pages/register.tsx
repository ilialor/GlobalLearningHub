import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(1, 'Display name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      displayName: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        password: data.password,
      });
      
      toast({
        title: t('registrationSuccessful'),
        description: t('youCanNowLogin'),
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: t('registrationFailed'),
        description: t('usernameOrEmailAlreadyExists'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-lightest px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <svg className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-medium">{t('createAccount')}</h1>
            <p className="text-neutral-medium mt-1">{t('joinGlobalAcademy')}</p>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-dark mb-1">
                {t('username')}
              </label>
              <input
                id="username"
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  form.formState.errors.username ? 'border-error' : 'border-neutral-light'
                }`}
                {...form.register('username')}
              />
              {form.formState.errors.username && (
                <p className="mt-1 text-sm text-error">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-1">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  form.formState.errors.email ? 'border-error' : 'border-neutral-light'
                }`}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-error">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-neutral-dark mb-1">
                {t('displayName')}
              </label>
              <input
                id="displayName"
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  form.formState.errors.displayName ? 'border-error' : 'border-neutral-light'
                }`}
                {...form.register('displayName')}
              />
              {form.formState.errors.displayName && (
                <p className="mt-1 text-sm text-error">{form.formState.errors.displayName.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-dark mb-1">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  form.formState.errors.password ? 'border-error' : 'border-neutral-light'
                }`}
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-error">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-dark mb-1">
                {t('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  form.formState.errors.confirmPassword ? 'border-error' : 'border-neutral-light'
                }`}
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition"
              disabled={isLoading}
            >
              {isLoading ? t('registering') : t('register')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-neutral-medium">
              {t('alreadyHaveAccount')}{' '}
              <a href="/login" className="text-primary hover:underline">
                {t('login')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;