import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('loginFailed'),
        description: t('invalidCredentials'),
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
            <h1 className="text-2xl font-medium">{t('welcomeToGlobalAcademy')}</h1>
            <p className="text-neutral-medium mt-1">{t('pleaseLoginToContinue')}</p>
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
                autoComplete="username"
              />
              {form.formState.errors.username && (
                <p className="mt-1 text-sm text-error">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-dark">
                  {t('password')}
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  {t('forgotPassword')}
                </a>
              </div>
              <input
                id="password"
                type="password"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  form.formState.errors.password ? 'border-error' : 'border-neutral-light'
                }`}
                {...form.register('password')}
                autoComplete="current-password"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-error">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition"
              disabled={isLoading}
            >
              {isLoading ? t('loggingIn') : t('login')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-neutral-medium">
              {t('dontHaveAccount')}{' '}
              <a href="/register" className="text-primary hover:underline">
                {t('registerNow')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;