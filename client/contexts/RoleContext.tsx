import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 
  | 'root-admin' 
  | 'company-admin'
  | 'customer'
  | 'project-manager'
  | 'designer'
  | 'reviewer';

export interface User {
  name: string;
  role: UserRole;
  email: string;
  company?: string;
}

interface RoleContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const defaultUsers: Record<UserRole, User> = {
  'root-admin': {
    name: 'Администратор системы',
    role: 'root-admin',
    email: 'admin@pirnew.ru',
    company: 'СОД pirNew'
  },
  'company-admin': {
    name: 'Админ компании',
    role: 'company-admin', 
    email: 'company.admin@settltech.ru',
    company: 'setlgroup'
  },
  'customer': {
    name: 'Анна Смирнова',
    role: 'customer',
    email: 'a.smirnova@settltech.ru',
    company: 'setlgroup'
  },
  'project-manager': {
    name: 'Марсель Габдуллинов',
    role: 'project-manager',
    email: 'gainutdinov_ml@settltech.ru',
    company: 'setlgroup'
  },
  'designer': {
    name: 'Петр Иванов',
    role: 'designer',
    email: 'p.ivanov@projectcompany.ru',
    company: 'ПроектСтрой'
  },
  'reviewer': {
    name: 'Мария Петрова',
    role: 'reviewer',
    email: 'm.petrova@projectcompany.ru',
    company: 'ПроектСтрой'
  }
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(defaultUsers['customer']);

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

export { defaultUsers };
