import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  UserPlus,
  Settings,
  RefreshCw,
  FileText,
  Building2,
  ArrowLeft,
  Edit,
  Shield,
  Eye,
  PenTool
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  source: 'my-company' | 'contract' | 'manual';
  addedDate: string;
  lastSync?: string;
  contractRoles: ContractRole[];
  projects: string[];
  avatar?: string;
}

interface ContractRole {
  contractId: string;
  contractName: string;
  projectName: string;
  roles: ('signatory' | 'reviewer' | 'observer')[];
  status: 'active' | 'expired' | 'pending';
  startDate: string;
  endDate?: string;
}

interface Contract {
  id: string;
  number: string;
  projectName: string;
  status: 'active' | 'expired' | 'draft';
  startDate: string;
  endDate?: string;
  employees: string[]; // employee IDs
}

const mockOrganization = {
  id: '1',
  name: 'ПроектСтрой ООО',
  type: 'Проектирование'
};

const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    number: 'ДП-2024-001',
    projectName: 'ЖК «Северный парк»',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    employees: ['emp-1', 'emp-2', 'emp-3']
  },
  {
    id: 'contract-2', 
    number: 'ДП-2024-002',
    projectName: 'БЦ «Технологический»',
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    employees: ['emp-1', 'emp-4']
  }
];

const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Петр Иванов',
    position: 'Главный архитектор',
    email: 'p.ivanov@projectstroy.ru',
    phone: '+7 (495) 123-45-68',
    status: 'active',
    source: 'my-company',
    addedDate: '2024-01-15',
    lastSync: '2024-01-20',
    contractRoles: [
      {
        contractId: 'contract-1',
        contractName: 'ДП-2024-001',
        projectName: 'ЖК «Северный парк»',
        roles: ['signatory', 'reviewer'],
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-12-31'
      },
      {
        contractId: 'contract-2',
        contractName: 'ДП-2024-002', 
        projectName: 'БЦ «Технологический»',
        roles: ['signatory'],
        status: 'active',
        startDate: '2024-02-01',
        endDate: '2024-11-30'
      }
    ],
    projects: ['ЖК «Северный парк»', 'БЦ «Технологический»']
  },
  {
    id: 'emp-2',
    name: 'Анна Сидорова',
    position: 'Инженер-конструктор',
    email: 'a.sidorova@projectstroy.ru',
    phone: '+7 (495) 123-45-69',
    status: 'active',
    source: 'contract',
    addedDate: '2024-01-15',
    contractRoles: [
      {
        contractId: 'contract-1',
        contractName: 'ДП-2024-001',
        projectName: 'ЖК «Северный парк»',
        roles: ['reviewer'],
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-12-31'
      }
    ],
    projects: ['ЖК «Северный парк»']
  },
  {
    id: 'emp-3',
    name: 'Михаил Козлов',
    position: 'Инженер ОВ',
    email: 'm.kozlov@projectstroy.ru',
    phone: '+7 (495) 123-45-70',
    status: 'active',
    source: 'my-company',
    addedDate: '2024-01-15',
    lastSync: '2024-01-18',
    contractRoles: [
      {
        contractId: 'contract-1',
        contractName: 'ДП-2024-001',
        projectName: 'ЖК «Северный парк»',
        roles: ['observer'],
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-12-31'
      }
    ],
    projects: ['ЖК «Северный парк»']
  },
  {
    id: 'emp-4',
    name: 'Елена Волкова',
    position: 'Инженер ВК',
    email: 'e.volkova@projectstroy.ru',
    phone: '+7 (495) 123-45-71',
    status: 'pending',
    source: 'manual',
    addedDate: '2024-01-22',
    contractRoles: [
      {
        contractId: 'contract-2',
        contractName: 'ДП-2024-002',
        projectName: 'БЦ «Технологический»',
        roles: ['reviewer'],
        status: 'pending',
        startDate: '2024-02-01',
        endDate: '2024-11-30'
      }
    ],
    projects: ['БЦ «Технологиче��кий»']
  }
];

const mockExternalEmployees = [
  {
    id: 'ext-emp-1',
    name: 'Ольга Смирнова',
    position: 'Инженер-электрик',
    email: 'o.smirnova@projectstroy.ru',
    phone: '+7 (495) 123-45-72',
    isExternal: true
  },
  {
    id: 'ext-emp-2',
    name: 'Дмитрий Петров',
    position: 'Инженер связи',
    email: 'd.petrov@projectstroy.ru',
    phone: '+7 (495) 123-45-73',
    isExternal: true
  }
];

const statusConfig = {
  'active': { label: 'Активен', color: 'bg-green-500', icon: CheckCircle },
  'inactive': { label: 'Неактивен', color: 'bg-gray-500', icon: Clock },
  'pending': { label: 'Ожидает подтверждения', color: 'bg-yellow-500', icon: AlertCircle }
};

const sourceConfig = {
  'my-company': { label: 'Моя компания', color: 'bg-blue-500', icon: Building2 },
  'contract': { label: 'Из договора', color: 'bg-purple-500', icon: FileText },
  'manual': { label: 'Добавлен вручную', color: 'bg-gray-500', icon: UserPlus }
};

const roleConfig = {
  'signatory': { label: 'Подписант', color: 'bg-red-500', icon: PenTool },
  'reviewer': { label: 'Проверяющий', color: 'bg-blue-500', icon: Eye },
  'observer': { label: 'Наблюдатель', color: 'bg-gray-500', icon: Eye }
};

export default function OrganizationEmployees() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [externalSearchTerm, setExternalSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [showSyncNeeded, setShowSyncNeeded] = useState(true);

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || emp.source === sourceFilter;
    const matchesProject = projectFilter === 'all' || emp.projects.some(p => p.includes(projectFilter));
    return matchesSearch && matchesStatus && matchesSource && matchesProject;
  });

  const filteredExternalEmployees = mockExternalEmployees.filter(emp =>
    emp.name.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(externalSearchTerm.toLowerCase())
  );

  const syncNeededEmployees = mockEmployees.filter(emp => 
    emp.source === 'my-company' && 
    emp.lastSync && 
    new Date(emp.lastSync) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // older than 7 days
  );

  const handleAddEmployee = (extEmp: any) => {
    console.log('Adding employee:', extEmp);
    setIsAddDialogOpen(false);
  };

  const handleSyncEmployees = () => {
    console.log('Syncing employees with My Company');
    setShowSyncNeeded(false);
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'for employees:', selectedEmployees);
    setSelectedEmployees([]);
  };

  const stats = {
    total: mockEmployees.length,
    active: mockEmployees.filter(emp => emp.status === 'active').length,
    pending: mockEmployees.filter(emp => emp.status === 'pending').length,
    needsSync: syncNeededEmployees.length,
    withContracts: mockEmployees.filter(emp => emp.contractRoles.length > 0).length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2">
          <Link to="/organizations" className="flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Организации
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{mockOrganization.name}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Сотрудники</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Сотрудники - {mockOrganization.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Управление сотрудниками организации и их ролями в договорах
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSyncEmployees}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Синхронизация
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Добавить сотрудника</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <ExternalLink className="w-5 h-5" />
                    <span>Добавить сотрудника из системы "Моя компания"</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск по имени или должности..."
                      value={externalSearchTerm}
                      onChange={(e) => setExternalSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredExternalEmployees.map((emp) => (
                      <Card key={emp.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {emp.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold">{emp.name}</h3>
                                <p className="text-sm text-gray-600">{emp.position}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                  <div>{emp.email}</div>
                                  <div>{emp.phone}</div>
                                </div>
                              </div>
                            </div>
                            <Button onClick={() => handleAddEmployee(emp)}>
                              Добавить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sync Alert */}
        {showSyncNeeded && syncNeededEmployees.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-800">
                      Требуется синхронизация
                    </div>
                    <div className="text-sm text-yellow-700">
                      {syncNeededEmployees.length} сотрудников не синхронизированы с системой "Моя компания" более 7 дней
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSyncNeeded(false)}>
                    Скрыть
                  </Button>
                  <Button size="sm" onClick={handleSyncEmployees}>
                    Синхронизировать
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего сотрудников</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Активных</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Ожидают подтверждения</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{stats.withContracts}</div>
              <div className="text-sm text-gray-600">С ролями в договорах</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">{stats.needsSync}</div>
              <div className="text-sm text-gray-600">Требуют синхронизации</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
            <TabsTrigger value="contracts">По договорам</TabsTrigger>
            <TabsTrigger value="roles">Управление ролями</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск сотрудник��в..."
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
                      <SelectItem value="active">Активные</SelectItem>
                      <SelectItem value="inactive">Неактивные</SelectItem>
                      <SelectItem value="pending">Ожидают подтверждения</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Все источники" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все источники</SelectItem>
                      <SelectItem value="my-company">Моя компания</SelectItem>
                      <SelectItem value="contract">Из договора</SelectItem>
                      <SelectItem value="manual">Добавлен вручную</SelectItem>
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
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                {selectedEmployees.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-800">
                      Выбрано сотрудников: {selectedEmployees.length}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('sync')}>
                        Синхронизировать
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                        Деактивировать
                      </Button>
                      <Button size="sm" onClick={() => setSelectedEmployees([])}>
                        Отменить выбор
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employees List */}
            <div className="space-y-4">
              {filteredEmployees.map((employee) => {
                const statusInfo = statusConfig[employee.status];
                const sourceInfo = sourceConfig[employee.source];
                const StatusIcon = statusInfo.icon;
                const SourceIcon = sourceInfo.icon;
                const needsSync = employee.source === 'my-company' && 
                                 employee.lastSync && 
                                 new Date(employee.lastSync) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                return (
                  <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <div className="flex items-center pt-1">
                          <Checkbox
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEmployees([...selectedEmployees, employee.id]);
                              } else {
                                setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                              }
                            }}
                          />
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white font-medium">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{employee.name}</h3>
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge className={`${sourceInfo.color} text-white`}>
                              <SourceIcon className="w-3 h-3 mr-1" />
                              {sourceInfo.label}
                            </Badge>
                            {needsSync && (
                              <Badge variant="destructive">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Требует синхронизации
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600 mb-3">{employee.position}</p>

                          <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Контактная информация</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                  {employee.email}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                  {employee.phone}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                  Добавлен: {employee.addedDate}
                                </div>
                                {employee.lastSync && (
                                  <div className="flex items-center">
                                    <RefreshCw className="w-3 h-3 mr-2 text-gray-400" />
                                    Синхронизирован: {employee.lastSync}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Роли в договорах</div>
                              <div className="space-y-2">
                                {employee.contractRoles.map((contractRole, index) => (
                                  <div key={index} className="p-2 bg-gray-50 rounded">
                                    <div className="text-sm font-medium">{contractRole.projectName}</div>
                                    <div className="text-xs text-gray-600 mb-1">{contractRole.contractName}</div>
                                    <div className="flex flex-wrap gap-1">
                                      {contractRole.roles.map((role, roleIndex) => {
                                        const roleInfo = roleConfig[role];
                                        const RoleIcon = roleInfo.icon;
                                        return (
                                          <Badge key={roleIndex} className={`${roleInfo.color} text-white text-xs`}>
                                            <RoleIcon className="w-2 h-2 mr-1" />
                                            {roleInfo.label}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {employee.projects.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Участвует в проектах:</div>
                              <div className="flex flex-wrap gap-2">
                                {employee.projects.map((project, index) => (
                                  <Badge key={index} variant="secondary">{project}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm">
                            <Shield className="w-4 h-4 mr-2" />
                            Роли
                          </Button>
                          {employee.source === 'my-company' && (
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Синхронизировать
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="contracts" className="mt-6">
            <div className="space-y-4">
              {mockContracts.map((contract) => (
                <Card key={contract.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="w-5 h-5" />
                          <span>{contract.number} - {contract.projectName}</span>
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Период: {contract.startDate} - {contract.endDate}
                        </p>
                      </div>
                      <Badge className={contract.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                        {contract.status === 'active' ? 'Действует' : 'Завершен'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium text-gray-500 mb-3">
                      Участники договора ({contract.employees.length}):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contract.employees.map((empId) => {
                        const employee = mockEmployees.find(e => e.id === empId);
                        const contractRole = employee?.contractRoles.find(cr => cr.contractId === contract.id);
                        
                        if (!employee) return null;

                        return (
                          <div key={empId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-sm">{employee.name}</div>
                                <div className="text-xs text-gray-600">{employee.position}</div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {contractRole?.roles.map((role, index) => {
                                const roleInfo = roleConfig[role];
                                const RoleIcon = roleInfo.icon;
                                return (
                                  <Badge key={index} className={`${roleInfo.color} text-white text-xs`}>
                                    <RoleIcon className="w-2 h-2 mr-1" />
                                    {roleInfo.label}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Управление ролями</h3>
                <p className="text-gray-500">
                  Здесь будет интерфейс для массового назначения и изменения ролей сотрудников в договорах
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredEmployees.length === 0 && activeTab === 'employees' && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Сотрудники не найдены</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
