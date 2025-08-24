import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  PenTool,
  Edit,
  RefreshCw,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface Contract {
  id: string;
  number: string;
  projectName: string;
  customerName: string;
  executorName: string;
  status: 'active' | 'expired' | 'draft';
  startDate: string;
  endDate: string;
  amount: string;
  employeeCount: number;
  description: string;
  type: string;
}

interface ContractEmployee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  roles: ('signatory' | 'reviewer' | 'observer')[];
  organization: string;
  status: 'active' | 'inactive';
}

const mockContracts: Record<string, Contract> = {
  'contract-1': {
    id: 'contract-1',
    number: 'ДП-2024-001',
    projectName: 'ЖК «Северный парк»',
    customerName: 'СетлГрупп ООО',
    executorName: 'ПроектСтрой ООО',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    amount: '5,500,000 ₽',
    employeeCount: 8,
    description: 'Договор на выполнение проектно-изыскательских работ для строительства жилого комплекса «Северный парк» в Московской области.',
    type: 'Проектирование'
  },
  'contract-2': {
    id: 'contract-2',
    number: 'ДП-2024-002',
    projectName: 'БЦ «Технологический»',
    customerName: 'СетлГрупп ООО',
    executorName: 'ПроектСтрой ООО',
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    amount: '3,200,000 ₽',
    employeeCount: 5,
    description: 'Договор на выполнение проектных работ для строительства бизнес-центра «Технологический» в г. Москва.',
    type: 'Проектирование'
  }
};

const mockContractEmployees: Record<string, ContractEmployee[]> = {
  'contract-1': [
    {
      id: 'emp-1',
      name: 'Петр Иванов',
      position: 'Главный архитектор',
      email: 'p.ivanov@projectstroy.ru',
      phone: '+7 (495) 123-45-68',
      roles: ['signatory', 'reviewer'],
      organization: 'ПроектСтрой ООО',
      status: 'active'
    },
    {
      id: 'emp-2',
      name: 'Анна Сидорова',
      position: 'Инженер-конструктор',
      email: 'a.sidorova@projectstroy.ru',
      phone: '+7 (495) 123-45-69',
      roles: ['reviewer'],
      organization: 'ПроектСтрой ООО',
      status: 'active'
    },
    {
      id: 'emp-3',
      name: 'Анна Смирнова',
      position: 'Заказчик',
      email: 'a.smirnova@settltech.ru',
      phone: '+7 (495) 123-45-67',
      roles: ['signatory'],
      organization: 'СетлГрупп ООО',
      status: 'active'
    },
    {
      id: 'emp-4',
      name: 'Марсель Габдуллинов',
      position: 'Менеджер проекта',
      email: 'gainutdinov_ml@settltech.ru',
      phone: '+7 (495) 123-45-68',
      roles: ['signatory', 'reviewer'],
      organization: 'СетлГрупп ООО',
      status: 'active'
    }
  ],
  'contract-2': [
    {
      id: 'emp-1',
      name: 'Петр Иванов',
      position: 'Главный архитектор',
      email: 'p.ivanov@projectstroy.ru',
      phone: '+7 (495) 123-45-68',
      roles: ['signatory'],
      organization: 'ПроектСтрой ООО',
      status: 'active'
    },
    {
      id: 'emp-5',
      name: 'Елена Волкова',
      position: 'Главный инженер',
      email: 'e.volkova@settltech.ru',
      phone: '+7 (495) 123-45-70',
      roles: ['reviewer'],
      organization: 'СетлГрупп ООО',
      status: 'active'
    }
  ]
};

const statusConfig = {
  'active': { label: 'Действует', color: 'bg-green-500', icon: CheckCircle },
  'expired': { label: 'Завершен', color: 'bg-gray-500', icon: Clock },
  'draft': { label: 'Черновик', color: 'bg-yellow-500', icon: AlertCircle }
};

const roleConfig = {
  'signatory': { label: 'Подписант', color: 'bg-red-500', icon: PenTool },
  'reviewer': { label: 'Согласующий', color: 'bg-blue-500', icon: Eye },
  'observer': { label: 'Наблюдатель', color: 'bg-gray-500', icon: Eye }
};

export default function ContractDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const initialContract = id ? mockContracts[id] : null;
  const initialEmployees = id ? mockContractEmployees[id] || [] : [];

  // Локальное состояние договора и участников для отображения обновлений после сохранения
  const [contractData, setContractData] = useState<Contract | null>(initialContract);
  const [employeesState, setEmployeesState] = useState<ContractEmployee[]>(initialEmployees);

  // Диалог редактирования
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Поля формы редактирования
  const [formNumber, setFormNumber] = useState(initialContract?.number ?? '');
  const [formProjectName, setFormProjectName] = useState(initialContract?.projectName ?? '');
  const [formCustomerName, setFormCustomerName] = useState(initialContract?.customerName ?? '');
  const [formExecutorName, setFormExecutorName] = useState(initialContract?.executorName ?? '');
  const [formStartDate, setFormStartDate] = useState(initialContract?.startDate ?? '');
  const [formEndDate, setFormEndDate] = useState(initialContract?.endDate ?? '');
  const [formAmount, setFormAmount] = useState(initialContract?.amount ?? '');
  const [formDescription, setFormDescription] = useState(initialContract?.description ?? '');
  const [formType, setFormType] = useState(initialContract?.type ?? '');

  // Управление участниками (как в форме добавления)
  const roleOptions = [
    { value: 'signatory', label: 'Подписант', icon: PenTool, color: 'bg-red-500' },
    { value: 'reviewer', label: 'Согласующий', icon: Eye, color: 'bg-blue-500' },
    { value: 'observer', label: 'Наблюдатель', icon: Eye, color: 'bg-gray-500' }
  ];

  // Доступные сотрудники по названию организации (как в форме добавления)
  const availableEmployeesByOrgName: Record<string, Array<{ id: string; name: string; position: string; email: string; organization: string }>> = {
    'СетлГрупп ООО': [
      { id: 'emp-customer-1', name: 'Анна Смирнова', position: 'Заказчик', email: 'a.smirnova@settltech.ru', organization: 'СетлГрупп ООО' },
      { id: 'emp-customer-2', name: 'Марсель Габдуллинов', position: 'Менеджер проекта', email: 'gainutdinov_ml@settltech.ru', organization: 'СетлГрупп ООО' },
      { id: 'emp-customer-3', name: 'Дмитрий Кузнецов', position: 'Главный архитектор', email: 'd.kuznetsov@settltech.ru', organization: 'СетлГрупп ООО' },
    ],
    'ПроектСтрой ООО': [
      { id: 'emp-contractor-1', name: 'Петр Иванов', position: 'Главный архитектор', email: 'p.ivanov@projectstroy.ru', organization: 'ПроектСтрой ООО' },
      { id: 'emp-contractor-2', name: 'Анна Сидорова', position: 'Инженер-конструктор', email: 'a.sidorova@projectstroy.ru', organization: 'ПроектСтрой ООО' },
      { id: 'emp-contractor-3', name: 'Михаил Козлов', position: 'Инженер ОВ', email: 'm.kozlov@projectstroy.ru', organization: 'ПроектСтрой ООО' },
    ],
    'СтройЭкспертиза АО': [
      { id: 'emp-expert-1', name: 'Елена Волкова', position: 'Главный эксперт', email: 'e.volkova@stroyexpert.ru', organization: 'СтройЭкспертиза АО' },
      { id: 'emp-expert-2', name: 'Александр Соколов', position: 'Эксперт по конструкциям', email: 'a.sokolov@stroyexpert.ru', organization: 'СтройЭкспертиза АО' },
    ],
  };

  // Состояние выбранных ролей на форме
  const [selectedEmployees, setSelectedEmployees] = useState<{ [employeeId: string]: string[] }>(() => {
    const initial: { [employeeId: string]: string[] } = {};
    employeesState.forEach(emp => { initial[emp.id] = [...emp.roles]; });
    return initial;
  });
  const [showEmployeeSection, setShowEmployeeSection] = useState(true);

  const handleEmployeeRoleToggle = (employeeId: string, role: string) => {
    setSelectedEmployees(prev => {
      const currentRoles = prev[employeeId] || [];
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];

      if (newRoles.length === 0) {
        const { [employeeId]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [employeeId]: newRoles };
    });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => {
      const { [employeeId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSaveContract = () => {
    if (!contractData) return;
    // Обновляем локальные данные договора
    const updated: Contract = {
      ...contractData,
      number: formNumber,
      projectName: formProjectName,
      customerName: formCustomerName,
      executorName: formExecutorName,
      startDate: formStartDate,
      endDate: formEndDate,
      amount: formAmount,
      description: formDescription,
      type: formType,
    };
    setContractData(updated);

    // Формируем список участников из выбранных ролей
    const allAvailable = [
      ...(availableEmployeesByOrgName[formCustomerName] || []),
      ...(availableEmployeesByOrgName[formExecutorName] || []),
    ];
    const updatedEmployees: ContractEmployee[] = Object.keys(selectedEmployees).map(empId => {
      const found = allAvailable.find(e => e.id === empId);
      return {
        id: empId,
        name: found?.name || `Участник ${empId}`,
        position: found?.position || 'Участник',
        email: found?.email || 'n/a',
        phone: '',
        roles: selectedEmployees[empId] as ContractEmployee['roles'],
        organization: found?.organization || '-',
        status: 'active',
      };
    });
    setEmployeesState(updatedEmployees);

    setIsEditDialogOpen(false);
    console.log('Contract saved', updated, updatedEmployees);
  };

  if (!contractData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Договор не найден</h2>
          <p className="text-gray-500 mb-4">Запрашиваемый договор не существует или был удален.</p>
          <Link to="/contracts">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к списку договоров
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const statusInfo = statusConfig[contractData.status];
  const StatusIcon = statusInfo.icon;

  const customerEmployees = employeesState.filter(emp => emp.organization === contractData.customerName);
  const executorEmployees = employeesState.filter(emp => emp.organization === contractData.executorName);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2">
          <Link to="/contracts" className="flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Договоры
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{contractData.number}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {contractData.number}
              </h1>
              <Badge className={`${statusInfo.color} text-white`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            <h2 className="text-xl text-gray-600 mb-2">{contractData.projectName}</h2>
            <p className="text-gray-500">{contractData.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => {
              setFormNumber(contractData.number);
              setFormProjectName(contractData.projectName);
              setFormCustomerName(contractData.customerName);
              setFormExecutorName(contractData.executorName);
              setFormStartDate(contractData.startDate);
              setFormEndDate(contractData.endDate);
              setFormAmount(contractData.amount);
              setFormDescription(contractData.description);
              setFormType(contractData.type);
              // Инициализируем выбранные роли из текущих сотрудников
              const init: { [employeeId: string]: string[] } = {};
              employeesState.forEach(emp => { init[emp.id] = [...emp.roles]; });
              setSelectedEmployees(init);
              setIsEditDialogOpen(true);
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              Сверка участников
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Период действия</div>
                  <div className="font-semibold">{contractData.startDate} - {contractData.endDate}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-sm text-gray-500">Сумма договора</div>
                  <div className="font-semibold">{contractData.amount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-sm text-gray-500">Участников</div>
                  <div className="font-semibold">{contractData.employeeCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-500">Тип работ</div>
                  <div className="font-semibold">{contractData.type}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Общая информация</TabsTrigger>
            <TabsTrigger value="participants">Участники</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Заказчик</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold text-lg">{contractData.customerName}</div>
                      <div className="text-sm text-gray-600">Участников в договоре: {customerEmployees.length}</div>
                    </div>
                    <div className="space-y-2">
                      {customerEmployees.slice(0, 3).map((emp) => (
                        <div key={emp.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{emp.name}</div>
                            <div className="text-xs text-gray-600">{emp.position}</div>
                          </div>
                          <div className="flex gap-1">
                            {emp.roles.map((role, index) => {
                              const roleInfo = roleConfig[role];
                              return (
                                <Badge key={index} className={`${roleInfo.color} text-white text-xs`}>
                                  {roleInfo.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {customerEmployees.length > 3 && (
                        <div className="text-sm text-gray-500 text-center">
                          и еще {customerEmployees.length - 3} участников...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Исполнитель</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold text-lg">{contractData.executorName}</div>
                      <div className="text-sm text-gray-600">Участников в договоре: {executorEmployees.length}</div>
                    </div>
                    <div className="space-y-2">
                      {executorEmployees.slice(0, 3).map((emp) => (
                        <div key={emp.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{emp.name}</div>
                            <div className="text-xs text-gray-600">{emp.position}</div>
                          </div>
                          <div className="flex gap-1">
                            {emp.roles.map((role, index) => {
                              const roleInfo = roleConfig[role];
                              return (
                                <Badge key={index} className={`${roleInfo.color} text-white text-xs`}>
                                  {roleInfo.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {executorEmployees.length > 3 && (
                        <div className="text-sm text-gray-500 text-center">
                          и еще {executorEmployees.length - 3} участников...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Все участники договора</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employeesState.map((emp) => (
                      <div key={emp.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{emp.name}</div>
                          <div className="text-sm text-gray-600">{emp.position}</div>
                          <div className="text-xs text-gray-500">{emp.organization}</div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {emp.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {emp.phone}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {emp.roles.map((role, index) => {
                            const roleInfo = roleConfig[role];
                            const RoleIcon = roleInfo.icon;
                            return (
                              <Badge key={index} className={`${roleInfo.color} text-white`}>
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {roleInfo.label}
                              </Badge>
                            );
                          })}
                        </div>
                        <Badge className={emp.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                          {emp.status === 'active' ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Документы договора</h3>
                <p className="text-gray-500">
                  Здесь будут отображаться документы, связанные с данным договором
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">История изменений</h3>
                <p className="text-gray-500">
                  Здесь будет отображаться история изменений договора
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Диалог редактирования договора */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Редактирование договора</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractNumber">Номер договора *</Label>
                  <Input id="contractNumber" value={formNumber} onChange={e => setFormNumber(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="contractDateStart">Дата начала *</Label>
                  <Input id="contractDateStart" type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractName">Объект строительства *</Label>
                  <Input id="contractName" value={formProjectName} onChange={e => setFormProjectName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="contractDateEnd">Дата окончания *</Label>
                  <Input id="contractDateEnd" type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Заказчик *</Label>
                  <Select value={formCustomerName} onValueChange={setFormCustomerName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите заказчика" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(availableEmployeesByOrgName).map(org => (
                        <SelectItem key={org} value={org}>{org}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="executor">Исполнитель *</Label>
                  <Select value={formExecutorName} onValueChange={setFormExecutorName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите исполнителя" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(availableEmployeesByOrgName).map(org => (
                        <SelectItem key={org} value={org}>{org}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Сумма договора</Label>
                  <Input id="amount" value={formAmount} onChange={e => setFormAmount(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="type">Тип работ</Label>
                  <Input id="type" value={formType} onChange={e => setFormType(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3} />
              </div>

              {/* Управление участниками */}
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
                          {Object.keys(selectedEmployees).map((empId) => {
                            const allAvailable = [
                              ...(availableEmployeesByOrgName[formCustomerName] || []),
                              ...(availableEmployeesByOrgName[formExecutorName] || []),
                            ];
                            const emp = allAvailable.find(e => e.id === empId);
                            if (!emp) return null;
                            return (
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
                                    {selectedEmployees[emp.id].map((role: string) => {
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
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Available Employees by Organization */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Доступные сотрудники:</Label>

                      {[formCustomerName, formExecutorName].filter(Boolean).map(org => (
                        <div key={org} className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-2 text-blue-600">{org}</div>
                          <div className="space-y-2">
                            {(availableEmployeesByOrgName[org] || []).map((emp) => (
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
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t sticky bottom-0 bg-background">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveContract}>
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
