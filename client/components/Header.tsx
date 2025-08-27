import { useRole, defaultUsers, UserRole } from '../contexts/RoleContext';
import { extraUsers } from '../contexts/RoleContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bell, FileText, Building2, Users, List, BarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const roleLabels: Record<UserRole, string> = {
  'root-admin': 'Root-администратор',
  'company-admin': 'Администратор компании',
  'customer': 'Технический заказчик',
  'project-manager': 'Менеджер проекта',
  'designer': 'Проектировщик',
  'reviewer': 'Согласующий'
};

const navigationConfig: Record<UserRole, Array<{ label: string; href: string; icon: any }>> = {
  'root-admin': [
    { label: 'Объекты', href: '/objects', icon: Building2 },
    { label: 'Организации', href: '/organizations', icon: Users }
  ],
  'company-admin': [
    { label: 'Объекты', href: '/objects', icon: Building2 },
    { label: 'Процессы', href: '/processes', icon: List }
  ],
  'customer': [
    { label: 'Объекты', href: '/objects', icon: Building2 },
    { label: 'Согласование', href: '/approval', icon: FileText },
    { label: 'Поручения', href: '/tasks', icon: List },
    { label: 'Отчеты', href: '/reports', icon: BarChart }
  ],
  'project-manager': [
    { label: 'Объекты', href: '/objects', icon: Building2 },
    { label: 'Документы', href: '/documents', icon: FileText },
    { label: 'Поручения', href: '/tasks', icon: List },
    { label: 'Команда', href: '/team', icon: Users }
  ],
  'designer': [
    { label: 'Объекты', href: '/objects', icon: Building2 },
    { label: 'Документы', href: '/documents', icon: FileText },
    { label: 'Поручения', href: '/tasks', icon: List }
  ],
  'reviewer': [
    { label: 'Объекты', href: '/objects', icon: Building2 },
    { label: 'Согласование', href: '/approval', icon: FileText },
    { label: 'Поручения', href: '/tasks', icon: List }
  ]
};

export default function Header() {
  const { currentUser, setCurrentUser } = useRole();
  const location = useLocation();

  const navigation = navigationConfig[currentUser.role] || [];

  const buildValue = (u: { role: UserRole; name: string; company?: string }) => `${u.role}|${u.name}|${u.company || ''}`;
  const parseValue = (val: string): { role: UserRole; name: string; company?: string } => {
    const [role, name, company] = val.split('|');
    return { role: role as UserRole, name, company };
  };

  const handleRoleChange = (value: string) => {
    const { role, name, company } = parseValue(value);
    // попробовать найти точное совпадение среди дефолтных
    const def = defaultUsers[role];
    if (def && def.name === name && (def.company || '') === (company || '')) {
      setCurrentUser(def);
      return;
    }
    // иначе ищем среди дополнительных
    const extra = extraUsers.find(u => u.roleKey === role && u.name === name && (u.company || '') === (company || ''));
    if (extra) {
      setCurrentUser({ name: extra.name, role: extra.roleKey, email: extra.email, company: extra.company });
      return;
    }
    // по умолчанию — дефолтный пользователь роли
    setCurrentUser(def || currentUser);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      {/* Role Switcher */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <Select value={buildValue(currentUser)} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-96 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-96">
              {Object.entries(roleLabels).filter(([role]) => role !== 'project-manager').map(([role, label]) => {
                const user = defaultUsers[role as UserRole];
                const value = buildValue(user);
                return (
                  <SelectItem key={role} value={value}>
                    {`${label} — ${user.name} — ${user.company || '—'}`}
                  </SelectItem>
                );
              })}
              <div className="px-2 py-1 text-xs text-gray-500">Доп. пользователи</div>
              {extraUsers.map((u) => {
                const value = buildValue({ role: u.roleKey, name: u.name, company: u.company });
                return (
                  <SelectItem key={u.key} value={value}>
                    {`${roleLabels[u.roleKey]} — ${u.name} — ${u.company}`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-600">
            Демо режим - переключение ролей
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">П</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">pirNew</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button 
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.company}</div>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
