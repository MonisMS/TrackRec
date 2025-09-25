import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Select } from '../components/ui/select';
import { 
  User, 
  Bell, 
  Palette, 
  Shield,
  Download,
  Trash2
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export const Settings: React.FC = () => {
  const { user } = useUser();
  const [settings, setSettings] = React.useState({
    notifications: true,
    emailDigest: false,
    darkMode: false,
    autoSave: true,
    defaultPriority: 'medium',
    taskReminders: true,
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input 
                defaultValue={user?.firstName || ''} 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                defaultValue={user?.lastName || ''} 
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input 
              defaultValue={user?.primaryEmailAddress?.emailAddress || ''} 
              disabled
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed here. Manage it through your account settings.
            </p>
          </div>
          <Button>Save Profile Changes</Button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive notifications for task updates and reminders
              </div>
            </div>
            <Switch 
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Digest</div>
              <div className="text-sm text-muted-foreground">
                Receive daily email summaries of your tasks
              </div>
            </div>
            <Switch 
              checked={settings.emailDigest}
              onCheckedChange={(checked) => handleSettingChange('emailDigest', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Task Reminders</div>
              <div className="text-sm text-muted-foreground">
                Get reminded about upcoming due dates
              </div>
            </div>
            <Switch 
              checked={settings.taskReminders}
              onCheckedChange={(checked) => handleSettingChange('taskReminders', checked)}
            />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Preferences</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </div>
            </div>
            <Switch 
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Save</div>
              <div className="text-sm text-muted-foreground">
                Automatically save changes as you type
              </div>
            </div>
            <Switch 
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Priority</label>
            <Select 
              value={settings.defaultPriority}
              onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default priority for new tasks
            </p>
          </div>
        </div>
      </div>

      {/* Data & Privacy Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Data & Privacy</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground">
                Download all your tasks and data
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-destructive">Delete Account</div>
              <div className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </div>
            </div>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save All Changes</Button>
      </div>
    </div>
  );
};