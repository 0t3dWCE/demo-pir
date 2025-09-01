import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  FileText, 
  Calendar,
  Building2,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Edit,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Shield,
  Eye,
  PenTool,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Contract {
  id: string;
  number: string;
  name: string;
  projectName: string;
  projectId: string;
  customer: Organization;
  contractor: Organization;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  type: 'main' | 'amendment' | 'appendix';
  amount?: string;
  employeeCount: number;
  documentCount: number;
  lastUpdate: string;
  responsiblePerson: string;
  description?: string;
}

interface Organization {
  id: string;
  name: string;
  inn: string;
  director: string;
  phone: string;
  email: string;
}

interface ContractEmployee {
  id: string;
  name: string;
  position: string;
  email: string;
  roles: ('signatory' | 'reviewer' | 'observer')[];
  organizationId: string;
  organizationName: string;
  addedDate: string;
}

const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    number: 'ДП-2024-001',
    name: 'Договор на проектирование ЖК «Северный парк»',
    projectName: 'ЖК «Северный парк»',
    projectId: 'project-1',
    customer: {
      id: 'org-customer',
      name: 'СетлГрупп ООО',
      inn: '7736112233',
      director: 'Иванов Игорь Петрович',
      phone: '+7 (495) 111-22-33',
      email: 'contracts@settlgroup.ru'
    },
    contractor: {
      id: 'org-1',
      name: 'ПроектСтрой ООО',
      inn: '7736123456',
      director: 'Иванов Иван Иванович',
      phone: '+7 (495) 123-45-67',
      email: 'info@projectstroy.ru'
    },
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active',
    type: 'main',
    amount: '5,500,000 ₽',
    employeeCount: 8,
    documentCount: 124,
    lastUpdate: '2024-01-20',
    responsiblePerson: 'Петр Иванов',
    description: 'Проектирование жилого комплекса премиум-класса, включая архитектурные и инженерные решения'
  },
  {
    id: 'contract-2',
    number: 'ДП-2024-002',
    name: 'Договор на проектирование БЦ «Технологический»',
    projectName: 'БЦ «Технологический»',
    projectId: 'project-2',
    customer: {
      id: 'org-customer',
      name: 'СетлГрупп ООО',
      inn: '7736112233',
      director: 'Иванов Игорь Петрович',
      phone: '+7 (495) 111-22-33',
      email: 'contracts@settlgroup.ru'
    },
    contractor: {
      id: 'org-1',
      name: 'ПроектСтрой ООО',
      inn: '7736123456',
      director: 'Иванов Иван Иванович',
      phone: '+7 (495) 123-45-67',
      email: 'info@projectstroy.ru'
    },
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    status: 'active',
    type: 'main',
    amount: '3,200,000 ₽',
    employeeCount: 6,
    documentCount: 89,
    lastUpdate: '2024-01-18',
    responsiblePerson: 'Анна Сидорова',
    description: 'Проектирование офисного центра класса А с современными инженерными системами'
  },
  {
    id: 'contract-3',
    number: 'ДП-2023-015',
    name: 'Договор на экспертизу ТРК «Галерея»',
    projectName: 'ТРК «Галерея»',
    projectId: 'project-3',
    customer: {
      id: 'org-customer',
      name: 'СетлГрупп ООО',
      inn: '7736112233',
      director: 'Иванов Игорь Петрович',
      phone: '+7 (495) 111-22-33',
      email: 'contracts@settlgroup.ru'
    },
    contractor: {
      id: 'org-2',
      name: 'СтройЭкспертиза АО',
      inn: '7725987654',
      director: 'Петрова Анна Сергеевна',
      phone: '+7 (812) 987-65-43',
      email: 'contact@stroyexpert.ru'
    },
    startDate: '2023-12-01',
    endDate: '2024-01-31',
    status: 'expired',
    type: 'main',
    amount: '850,000 ₽',
    employeeCount: 4,
    documentCount: 156,
    lastUpdate: '2024-01-31',
    responsiblePerson: 'Михаил Козлов',
    description: 'Государственная экспертиза проектной документации торгово-развлекательного комплекса'
  },
  {
    id: 'contract-4',
    number: 'ДП-2024-003',
    name: 'Доп. соглашение к ДП-2024-001',
    projectName: 'ЖК «Северный Парк»',
    projectId: 'project-1',
    customer: {
      id: 'org-customer',
      name: 'СетлГрупп ООО',
      inn: '7736112233',
      director: 'Иванов Игорь Петрович',
      phone: '+7 (495) 111-22-33',
      email: 'contracts@settlgroup.ru'
    },
    contractor: {
      id: 'org-1',
      name: 'ПроектСтрой ООО',
      inn: '7736123456',
      director: 'Иванов Иван Иванович',
      phone: '+7 (495) 123-45-67',
      email: 'info@projectstroy.ru'
    },
    startDate: '2024-01-22',
    endDate: '2024-12-31',
    status: 'draft',
    type: 'amendment',
    amount: '320,000 ₽',
    employeeCount: 2,
    documentCount: 15,
    lastUpdate: '2024-01-22',
    responsiblePerson: 'Елена Волкова',
    description: 'Дополнительные работы по проектированию подземного паркинга'
  }
];

const mockContractEmployees: Record<string, ContractEmployee[]> = {
  'contract-1': [
    {
      id: 'emp-1',
      name: 'Петр Иванов',
      position: 'Главный архитектор',
      email: 'p.ivanov@projectstroy.ru',
      roles: ['signatory', 'reviewer'],
      organizationId: 'org-1',
      organizationName: 'ПроектСтрой ООО',
      addedDate: '2024-01-15'
    },
    {
      id: 'emp-2',
      name: 'Анна Сидорова',
      position: 'Инженер-конструктор',
      email: 'a.sidorova@projectstroy.ru',
      roles: ['reviewer'],
      organizationId: 'org-1',
      organizationName: 'ПроектСтрой ООО',
      addedDate: '2024-01-15'
    },
    {
      id: 'emp-customer-1',
      name: 'Анна Смирнова',
      position: 'Технический директор',
      email: 'a.smirnova@settlgroup.ru',
      roles: ['signatory'],
      organizationId: 'org-customer',
      organizationName: 'СетлГрупп ООО',
      addedDate: '2024-01-15'
    }
  ]
};

const statusConfig = {
  'draft': { label: 'Черновик', color: 'bg-gray-500', icon: Edit },
  'active': { label: 'Действует', color: 'bg-green-500', icon: CheckCircle },
  'expired': { label: 'Истёк', color: 'bg-red-500', icon: Clock },
  'cancelled': { label: 'Аннулирован', color: 'bg-red-700', icon: XCircle }
};

const typeConfig = {
  'main': { label: 'Основной', color: 'bg-blue-500' },
  'amendment': { label: 'Доп. соглашение', color: 'bg-purple-500' },
  'appendix': { label: 'Приложение', color: 'bg-orange-500' }
};

const roleConfig = {
  'signatory': { label: 'Подписант', color: 'bg-red-500', icon: PenTool },
  'reviewer': { label: 'Проверяющий', color: 'bg-blue-500', icon: Eye },
  'observer': { label: 'Наблюдатель', color: 'bg-gray-500', icon: Eye }
};

// Available employees from different organizations
const availableEmployees = {
  'org-customer': [ // СетлГрупп ООО
    {
      id: 'emp-customer-1',
      name: 'Анна Смирнова',
      position: 'Заказчик',
      email: 'a.smirnova@settltech.ru',
      organization: 'СетлГрупп ООО'
    },
    {
      id: 'emp-customer-2',
      name: 'Марсель Габдуллинов',
      position: 'Менеджер проекта',
      email: 'gainutdinov_ml@settltech.ru',
      organization: 'СетлГрупп ООО'
    },
    {
      id: 'emp-customer-3',
      name: 'Дмитрий Кузнецов',
      position: 'Главный архитектор',
      email: 'd.kuznetsov@settltech.ru',
      organization: 'СетлГрупп ООО'
    }
  ],
  'org-1': [ // ПроектСтрой ООО
    {
      id: 'emp-contractor-1',
      name: 'Петр Иванов',
      position: 'Главный архитектор',
      email: 'p.ivanov@projectstroy.ru',
      organization: 'ПроектСтрой ООО'
    },
    {
      id: 'emp-contractor-2',
      name: 'Анна Сидорова',
      position: 'Инженер-конструктор',
      email: 'a.sidorova@projectstroy.ru',
      organization: 'ПроектСтрой ООО'
    },
    {
      id: 'emp-contractor-3',
      name: 'Михаил Козлов',
      position: 'Инженер ОВ',
      email: 'm.kozlov@projectstroy.ru',
      organization: 'ПроектСтрой ООО'
    }
  ],
  'org-2': [ // СтройЭкспертиза АО
    {
      id: 'emp-expert-1',
      name: 'Елена Волкова',
      position: 'Главный эксперт',
      email: 'e.volkova@stroyexpert.ru',
      organization: 'СтройЭкспертиза АО'
    },
    {
      id: 'emp-expert-2',
      name: 'Александр Соколов',
      position: 'Эксперт по конструкциям',
      email: 'a.sokolov@stroyexpert.ru',
      organization: 'СтройЭкспертиза АО'
    }
  ]
};

const roleOptions = [
  { value: 'signatory', label: 'Подписант', icon: PenTool, color: 'bg-red-500' },
  { value: 'reviewer', label: 'Согласующий', icon: Eye, color: 'bg-blue-500' },
  { value: 'observer', label: 'Наблюдатель', icon: Eye, color: 'bg-gray-500' }
];

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedEmployees, setSelectedEmployees] = useState<{[key: string]: string[]}>({});
  const [showEmployeeSection, setShowEmployeeSection] = useState(false);

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    const matchesProject = projectFilter === 'all' || contract.projectName.includes(projectFilter);
    return matchesSearch && matchesStatus && matchesType && matchesProject;
  });

  const handleCreateContract = () => {
    console.log('Creating new contract');
    setIsCreateDialogOpen(false);
  };

  const handleSyncEmployees = (contractId: string) => {
    console.log('Syncing employees for contract:', contractId);
  };

  const handleEmployeeRoleToggle = (employeeId: string, role: string) => {
    setSelectedEmployees(prev => {
      const currentRoles = prev[employeeId] || [];
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];

      if (newRoles.length === 0) {
        const { [employeeId]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [employeeId]: newRoles
      };
    });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => {
      const { [employeeId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const getSelectedEmployeesData = () => {
    const result: any[] = [];
    Object.keys(selectedEmployees).forEach(empId => {
      // Find employee in all organizations
      Object.values(availableEmployees).forEach(orgEmps => {
        const emp = orgEmps.find(e => e.id === empId);
        if (emp) {
          result.push({
            ...emp,
            roles: selectedEmployees[empId]
          });
        }
      });
    });
    return result;
  };

  const stats = {
    total: mockContracts.length,
    active: mockContracts.filter(c => c.status === 'active').length,
    draft: mockContracts.filter(c => c.status === 'draft').length,
    expired: mockContracts.filter(c => c.status === 'expired').length,
    totalEmployees: mockContracts.reduce((sum, c) => sum + c.employeeCount, 0),
    totalAmount: mockContracts.reduce((sum, c) => {
      const amount = parseFloat(c.amount?.replace(/[^\d]/g, '') || '0');
      return sum + amount;
    }, 0)
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Управление договорами</h1>
            <p className="text-gray-600 mt-1">
              Централизованное управление всеми договорами в системе
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Создать договор</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Создание нового договора</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contractNumber">Номер договора *</Label>
                    <Input id="contractNumber" placeholder="ДП-2024-XXX" />
                  </div>
                  <div>
                    <Label htmlFor="contractDate">Дата заключения *</Label>
                    <Input id="contractDate" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contractName">Название договора *</Label>
                  <Input id="contractName" placeholder="Договор на проектирование..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Дата начала *</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Дата окончания *</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="project">Объект строительства *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите объект" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project-1">ЖК «Северный парк»</SelectItem>
                      <SelectItem value="project-2">БЦ «Технологический»</SelectItem>
                      <SelectItem value="project-3">ТРК «Галерея»</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer">Заказчик *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите заказчика" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="org-customer">СетлГрупп ООО</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contractor">Исполнитель *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите исполнителя" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="org-1">ПроектСтрой ООО</SelectItem>
                        <SelectItem value="org-2">СтройЭкспертиза АО</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea id="description" placeholder="Краткое описание договора..." rows={3} />
                </div>

                {/* Employee Selection Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-medium">Участники договора</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmployeeSection(!showEmployeeSection)}
                      className="flex items-center space-x-1"
                    >
                      <span>{showEmployeeSection ? 'Скрыть' : 'Добавить участников'}</span>
                      {showEmployeeSection ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {showEmployeeSection && (
                    <div className="space-y-4">
                      {/* Selected Employees */}
                      {Object.keys(selectedEmployees).length > 0 && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium mb-2 block">Выбранные участники:</Label>
                          <div className="space-y-2">
                            {getSelectedEmployeesData().map((emp) => (
                              <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {emp.name.split(' ').map((n: string) => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{emp.name}</div>
                                    <div className="text-xs text-gray-600">{emp.position}</div>
                                    <div className="text-xs text-gray-500">{emp.organization}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex flex-wrap gap-1">
                                    {emp.roles.map((role: string) => {
                                      const roleInfo = roleOptions.find(r => r.value === role);
                                      if (!roleInfo) return null;
                                      const RoleIcon = roleInfo.icon;
                                      return (
                                        <Badge key={role} className={`${roleInfo.color} text-white text-xs`}>
                                          <RoleIcon className="w-2 h-2 mr-1" />
                                          {roleInfo.label}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveEmployee(emp.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Available Employees by Organization */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Доступные сотрудники:</Label>

                        {/* Customer Organization */}
                        <div className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-2 text-blue-600">СетлГрупп ООО (Заказчик)</div>
                          <div className="space-y-2">
                            {availableEmployees['org-customer'].map((emp) => (
                              <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {emp.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{emp.name}</div>
                                    <div className="text-xs text-gray-600">{emp.position}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {roleOptions.map((role) => {
                                    const isSelected = selectedEmployees[emp.id]?.includes(role.value);
                                    const RoleIcon = role.icon;
                                    return (
                                      <Button
                                        key={role.value}
                                        type="button"
                                        variant={isSelected ? "default" : "ghost"}
                                        size="sm"
                                        className={`h-6 px-2 text-xs ${isSelected ? role.color + ' text-white' : ''}`}
                                        onClick={() => handleEmployeeRoleToggle(emp.id, role.value)}
                                      >
                                        <RoleIcon className="w-3 h-3 mr-1" />
                                        {role.label}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contractor Organizations */}
                        <div className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-2 text-green-600">ПроектСтрой ООО (Исполнитель)</div>
                          <div className="space-y-2">
                            {availableEmployees['org-1'].map((emp) => (
                              <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {emp.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{emp.name}</div>
                                    <div className="text-xs text-gray-600">{emp.position}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {roleOptions.map((role) => {
                                    const isSelected = selectedEmployees[emp.id]?.includes(role.value);
                                    const RoleIcon = role.icon;
                                    return (
                                      <Button
                                        key={role.value}
                                        type="button"
                                        variant={isSelected ? "default" : "ghost"}
                                        size="sm"
                                        className={`h-6 px-2 text-xs ${isSelected ? role.color + ' text-white' : ''}`}
                                        onClick={() => handleEmployeeRoleToggle(emp.id, role.value)}
                                      >
                                        <RoleIcon className="w-3 h-3 mr-1" />
                                        {role.label}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-2 text-purple-600">СтройЭкспертиза АО (Экспертиза)</div>
                          <div className="space-y-2">
                            {availableEmployees['org-2'].map((emp) => (
                              <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {emp.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{emp.name}</div>
                                    <div className="text-xs text-gray-600">{emp.position}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {roleOptions.map((role) => {
                                    const isSelected = selectedEmployees[emp.id]?.includes(role.value);
                                    const RoleIcon = role.icon;
                                    return (
                                      <Button
                                        key={role.value}
                                        type="button"
                                        variant={isSelected ? "default" : "ghost"}
                                        size="sm"
                                        className={`h-6 px-2 text-xs ${isSelected ? role.color + ' text-white' : ''}`}
                                        onClick={() => handleEmployeeRoleToggle(emp.id, role.value)}
                                      >
                                        <RoleIcon className="w-3 h-3 mr-1" />
                                        {role.label}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {Object.keys(selectedEmployees).length > 0 && (
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          <Users className="w-4 h-4 inline mr-1" />
                          Выбрано участников: {Object.keys(selectedEmployees).length}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t sticky bottom-0 bg-background">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreateContract}>
                    Создать договор
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего договоров</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Действующих</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Черновиков</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Истекших</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{stats.totalEmployees}</div>
              <div className="text-sm text-gray-600">Участников</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">
                {(stats.totalAmount / 1000000).toFixed(1)}М ₽
              </div>
              <div className="text-sm text-gray-600">Общая сумма</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Список договоров</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            <TabsTrigger value="sync">Сверка участников</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск договоров..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="active">Действующие</SelectItem>
                      <SelectItem value="draft">Черновики</SelectItem>
                      <SelectItem value="expired">Истекшие</SelectItem>
                      <SelectItem value="cancelled">Аннулированные</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="main">Основные</SelectItem>
                      <SelectItem value="amendment">Доп. соглашения</SelectItem>
                      <SelectItem value="appendix">Приложения</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Все проекты" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все проекты</SelectItem>
                      <SelectItem value="Северный">ЖК «Северный парк»</SelectItem>
                      <SelectItem value="Технологический">БЦ «Технологический»</SelectItem>
                      <SelectItem value="Галерея">ТРК «Галерея»</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Contracts List */}
            <div className="space-y-4">
              {filteredContracts.map((contract) => {
                const statusInfo = statusConfig[contract.status];
                const typeInfo = typeConfig[contract.type];
                const StatusIcon = statusInfo.icon;
                const isExpiringSoon = contract.status === 'active' && 
                                     new Date(contract.endDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <FileText className="w-6 h-6 text-gray-400" />
                            <h3 className="text-xl font-semibold">{contract.name}</h3>
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge className={`${typeInfo.color} text-white`}>
                              {typeInfo.label}
                            </Badge>
                            {isExpiringSoon && (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Истекает через {Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} дн.
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Основная информация</div>
                              <div className="space-y-1 text-sm">
                                <div><strong>Номер:</strong> {contract.number}</div>
                                <div><strong>Проект:</strong> {contract.projectName}</div>
                                <div><strong>Период:</strong> {contract.startDate} - {contract.endDate}</div>
                                {contract.amount && (
                                  <div><strong>Сумма:</strong> {contract.amount}</div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Стороны договора</div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <div className="font-medium">Заказчик:</div>
                                  <div>{contract.customer.name}</div>
                                  <div className="text-gray-600">ИНН: {contract.customer.inn}</div>
                                </div>
                                <div>
                                  <div className="font-medium">Исполнитель:</div>
                                  <div>{contract.contractor.name}</div>
                                  <div className="text-gray-600">ИНН: {contract.contractor.inn}</div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Статистика</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-2 text-gray-400" />
                                  {contract.employeeCount} участников
                                </div>
                                <div className="flex items-center">
                                  <FileText className="w-3 h-3 mr-2 text-gray-400" />
                                  {contract.documentCount} документов
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                  Обновлен: {contract.lastUpdate}
                                </div>
                                <div>Ответственный: {contract.responsiblePerson}</div>
                              </div>
                            </div>
                          </div>

                          {contract.description && (
                            <div className="mb-4">
                              <div className="text-sm font-medium text-gray-500 mb-1">Описание:</div>
                              <p className="text-sm text-gray-700">{contract.description}</p>
                            </div>
                          )}

                          {/* Contract Employees Preview */}
                          {mockContractEmployees[contract.id] && (
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">
                                Участники договора ({mockContractEmployees[contract.id].length}):
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {mockContractEmployees[contract.id].slice(0, 5).map((employee) => (
                                  <div key={employee.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-xs">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        {employee.name.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    </div>
                                    <span className="font-medium">{employee.name}</span>
                                    <div className="flex gap-1">
                                      {employee.roles.map((role, index) => {
                                        const roleInfo = roleConfig[role];
                                        const RoleIcon = roleInfo.icon;
                                        return (
                                          <Badge key={index} className={`${roleInfo.color} text-white text-xs px-1 py-0`}>
                                            <RoleIcon className="w-2 h-2" />
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                                {mockContractEmployees[contract.id].length > 5 && (
                                  <div className="flex items-center justify-center p-2 bg-gray-100 rounded text-xs text-gray-500">
                                    +{mockContractEmployees[contract.id].length - 5} еще
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-6">
                          <Link to={`/contracts/${contract.id}`}>
                            <Button variant="outline" size="sm" className="w-48 justify-start">
                              <Eye className="w-4 h-4 mr-2" />
                              Просмотр
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="w-48 justify-start">
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" className="w-48 justify-start" onClick={() => handleSyncEmployees(contract.id)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Сверка участников
                          </Button>
                          <Button variant="outline" size="sm" className="w-48 justify-start">
                            <Users className="w-4 h-4 mr-2" />
                            Участники
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Аналитика договоров</h3>
                <p className="text-gray-500">
                  Здесь будет отображаться аналитическая информация по договорам: статистика по срокам, суммам, участникам
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Сверка участников</h3>
                <p className="text-gray-500">
                  Инструменты для автоматической сверки участников договоров с системой "Моя компания" и выявления расхождений
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredContracts.length === 0 && activeTab === 'list' && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Договоры не найдены</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
