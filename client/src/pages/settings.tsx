import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Settings = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  // Mock state for settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [mobilePushNotifications, setMobilePushNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState('system');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userName, setUserName] = useState(user?.displayName || user?.username || '');

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isVisible={sidebarVisible} />
          <main className="flex-1 overflow-y-auto bg-neutral-lightest">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center py-16">
                <h1 className="text-2xl font-medium mb-2">{t('loginRequired')}</h1>
                <p className="text-neutral-medium mb-4">{t('pleaseLoginToAccessSettings')}</p>
                <a
                  href="/login"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                >
                  {t('login')}
                </a>
              </div>
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />

        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-medium mb-6">{t('settings')}</h1>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-neutral-light">
                <div className="flex">
                  <button
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'account'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-neutral-medium hover:text-neutral-dark'
                    }`}
                    onClick={() => setActiveTab('account')}
                  >
                    {t('account')}
                  </button>
                  <button
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'notifications'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-neutral-medium hover:text-neutral-dark'
                    }`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    {t('notifications')}
                  </button>
                  <button
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'preferences'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-neutral-medium hover:text-neutral-dark'
                    }`}
                    onClick={() => setActiveTab('preferences')}
                  >
                    {t('preferences')}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium mb-4">{t('personalInformation')}</h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">{t('name')}</Label>
                          <Input 
                            id="name" 
                            value={userName} 
                            onChange={(e) => setUserName(e.target.value)} 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">{t('email')}</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={userEmail} 
                            onChange={(e) => setUserEmail(e.target.value)} 
                            className="mt-1"
                          />
                        </div>
                        <Button className="mt-2">{t('saveChanges')}</Button>
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-light pt-6">
                      <h2 className="text-lg font-medium mb-4">{t('password')}</h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                          <Input id="currentPassword" type="password" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">{t('newPassword')}</Label>
                          <Input id="newPassword" type="password" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                          <Input id="confirmPassword" type="password" className="mt-1" />
                        </div>
                        <Button className="mt-2">{t('updatePassword')}</Button>
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-light pt-6">
                      <h2 className="text-lg font-medium mb-4 text-error">{t('dangerZone')}</h2>
                      <p className="text-neutral-medium mb-4">{t('accountDeletionWarning')}</p>
                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={handleLogout}>{t('logout')}</Button>
                        <Button variant="destructive">{t('deleteAccount')}</Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium mb-4">{t('notificationSettings')}</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t('emailNotifications')}</h3>
                          <p className="text-sm text-neutral-medium">{t('emailNotificationsDescription')}</p>
                        </div>
                        <Switch 
                          checked={emailNotifications} 
                          onCheckedChange={setEmailNotifications} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t('pushNotifications')}</h3>
                          <p className="text-sm text-neutral-medium">{t('pushNotificationsDescription')}</p>
                        </div>
                        <Switch 
                          checked={mobilePushNotifications} 
                          onCheckedChange={setMobilePushNotifications} 
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium mb-4">{t('learningPreferences')}</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t('autoplayVideos')}</h3>
                          <p className="text-sm text-neutral-medium">{t('autoplayVideosDescription')}</p>
                        </div>
                        <Switch 
                          checked={autoplay} 
                          onCheckedChange={setAutoplay} 
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">{t('preferredLanguage')}</h3>
                        <Select 
                          value={preferredLanguage} 
                          onValueChange={setPreferredLanguage}
                        >
                          <SelectTrigger className="w-full max-w-xs">
                            <SelectValue placeholder={t('selectLanguage')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="system">{t('systemDefault')}</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                            <SelectItem value="ru">Русский</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Settings;