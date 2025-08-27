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
import { 
  Search, 
  Plus, 
  Building, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  UserPlus
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  type: string;
  inn: string;
  ogrn: string;
  legalAddress: string;
  actualAddress: string;
  director: string;
  phone: string;
  email: string;
  employeeCount: number;
  status: 'active' | 'inactive' | 'pending';
  addedDate: string;
  projects: string[];
  activityTypes: string[];
}

interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'ПроектСтрой ООО',
    type: 'Проектирование',
    inn: '7736123456',
    ogrn: '1157746123456',
    legalAddress: 'г. Москва, ул. Строительная, д. 15',
    actualAddress: 'г. Москва, ул. Строительная, д. 15',
    director: 'Иванов Иван Иванович',
    phone: '+7 (495) 123-45-67',
    email: 'info@projectstroy.ru',
    employeeCount: 25,
    status: 'active',
    addedDate: '2024-01-15',
    projects: ['ЖК «Северный парк»', 'БЦ «Технологический»'],
    activityTypes: ['Архитектурно-строительное проектирование', 'Инженерные изыскания']
  },
  {
    id: '2',
    name: 'СтройЭкспертиза АО',
    type: 'Экспертиза',
    inn: '7725987654',
    ogrn: '1037739987654',
    legalAddress: 'г. Санкт-Петербург, пр. Невский, д. 100',
    actualAddress: 'г. Санкт-Петербург, пр. Невский, д. 100',
    director: 'Петрова Анна Сергеевна',
    phone: '+7 (812) 987-65-43',
    email: 'contact@stroyexpert.ru',
    employeeCount: 12,
    status: 'active',
    addedDate: '2024-01-08',
    projects: ['ТРК «Галерея»'],
    activityTypes: ['Государственная экспертиза', 'Негосударственная экспертиза']
  },
  {
    id: '3',
    name: 'ИнжиниринГрупп ООО',
    type: 'Инженерные системы',
    inn: '7701234567',
    ogrn: '1027701234567',
    legalAddress: 'г. Екатеринбург, ул. Техническая, д. 42',
    actualAddress: 'г. Екатеринбург, ул. Техническая, д. 42',
    director: 'Козлов Михаил Александрович',
    phone: '+7 (343) 456-78-90',
    email: 'info@inzgrup.ru',
    employeeCount: 8,
    status: 'pending',
    addedDate: '2024-01-20',
    projects: [],
    activityTypes: ['Проектирование инженерных систем', 'Авторский надзор']
  }
];

const mockExternalOrganizations = [
  {
    id: 'ext-1',
    name: 'СевЗапСтрой ООО',
    type: 'Строительство',
    inn: '7812345678',
    ogrn: '1027812345678',
    director: 'Смирнов Олег Владимирович',
    employeeCount: 45,
    activityTypes: ['Промышленное строительство', 'Гражданское строительство'],
    isExternal: true
  },
  {
    id: 'ext-2',
    name: 'ТехПроект Плюс ООО',
    type: 'Проектирование',
    inn: '7845678901',
    ogrn: '1067845678901',
    director: 'Волкова Елена Петровна',
    employeeCount: 18,
    activityTypes: ['Конструктивные решения', 'Техно��огические решения'],
    isExternal: true
  }
];

const mockEmployees: Record<string, Employee[]> = {
  '1': [
    {
      id: 'emp-1-1',
      name: 'Петр Иванов',
      position: 'Главный архитектор',
      email: 'p.ivanov@projectstroy.ru',
      phone: '+7 (495) 123-45-68',
      status: 'active'
    },
    {
      id: 'emp-1-2',
      name: 'Анна Сидорова',
      position: 'Инженер-конструктор',
      email: 'a.sidorova@projectstroy.ru',
      phone: '+7 (495) 123-45-69',
      status: 'active'
    },
    {
      id: 'emp-1-3',
      name: 'Михаил Козлов',
      position: 'Инженер ОВ',
      email: 'm.kozlov@projectstroy.ru',
      phone: '+7 (495) 123-45-70',
      status: 'active'
    }
  ]
};

// Справочник объектов, добавленных в систему (демо-данные)
const mockObjects: { id: string; name: string }[] = [
  { id: 'obj-1', name: 'Объект «ЖК Северный парк»' },
  { id: 'obj-2', name: 'Объект «БЦ Технологический»' },
  { id: 'obj-3', name: 'ТРК «Галерея»' },
  { id: 'obj-4', name: 'Промзона «Восточная»' }
];

const statusConfig = {
  'active': { label: 'Активна', color: 'bg-green-500', icon: CheckCircle },
  'inactive': { label: 'Неактивна', color: 'bg-gray-500', icon: Clock },
  'pending': { label: 'На рассмотрении', color: 'bg-yellow-500', icon: AlertCircle }
};

export default function Organizations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [externalSearchTerm, setExternalSearchTerm] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // Локальное состояние списка организаций, чтобы отражать назначения на объекты
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);

  // Диалог назначения на объект
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigningOrganization, setAssigningOrganization] = useState<Organization | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | undefined>(undefined);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.inn.includes(searchTerm) ||
                         org.director.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    const matchesType = typeFilter === 'all' || org.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredExternalOrganizations = mockExternalOrganizations.filter(org =>
    org.name.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
    org.inn.includes(externalSearchTerm)
  );

  const handleAddOrganization = (extOrg: any) => {
    console.log('Adding organization:', extOrg);
    setIsAddDialogOpen(false);
    // В реальном приложении здесь будет API вызов
  };

  const handleAssignToObject = (orgId: string, objectName: string) => {
    setOrganizations(prev => prev.map(org => {
      if (org.id !== orgId) return org;
      // используем существующее поле projects как список объектов
      const nextProjects = Array.from(new Set([...(org.projects || []), objectName]));
      return { ...org, projects: nextProjects };
    }));
  };

  const stats = {
    total: organizations.length,
    active: organizations.filter(org => org.status === 'active').length,
    pending: organizations.filter(org => org.status === 'pending').length,
    totalEmployees: organizations.reduce((sum, org) => sum + org.employeeCount, 0)
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Управление организациями</h1>
            <p className="text-gray-600 mt-1">
              Поиск, добавление и управление подрядными организациями
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Добавить организацию</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <ExternalLink className="w-5 h-5" />
                  <span>Добавить организацию из системы "Моя компания"</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по названию или ИНН..."
                    value={externalSearchTerm}
                    onChange={(e) => setExternalSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredExternalOrganizations.map((org) => (
                    <Card key={org.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{org.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{org.type}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">ИНН:</span> {org.inn}
                              </div>
                              <div>
                                <span className="font-medium">ОГРН:</span> {org.ogrn}
                              </div>
                              <div>
                                <span className="font-medium">Руководитель:</span> {org.director}
                              </div>
                              <div>
                                <span className="font-medium">Сотрудников:</span> {org.employeeCount}
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium text-sm">Виды деятельности:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {org.activityTypes.map((type, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleAddOrganization(org)}
                            className="ml-4"
                          >
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

        

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Список организаций</TabsTrigger>
            <TabsTrigger value="assignments">Назначения по проектам</TabsTrigger>
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск организаций..."
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
                      <SelectItem value="pending">На рассмотрении</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="Проектирование">Проектирование</SelectItem>
                      <SelectItem value="Экспертиза">Экспертиза</SelectItem>
                      <SelectItem value="Строительство">Строительство</SelectItem>
                      <SelectItem value="Инженерные системы">Инженерные системы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Organizations List */}
            <div className="space-y-4">
              {filteredOrganizations.map((org) => {
                const statusInfo = statusConfig[org.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={org.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Building className="w-6 h-6 text-gray-400" />
                            <h3 className="text-xl font-semibold">{org.name}</h3>
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge variant="outline">{org.type}</Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Основная информация</div>
                              <div className="space-y-1 text-sm">
                                <div>ИНН: {org.inn}</div>
                                <div>ОГРН: {org.ogrn}</div>
                                <div>Руководитель: {org.director}</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Контакты</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-2" />
                                  {org.phone}
                                </div>
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-2" />
                                  {org.email}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-2" />
                                  {org.actualAddress}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Статистика</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-2" />
                                  {org.employeeCount} сотрудников
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-2" />
                                  Добавлено: {org.addedDate}
                                </div>
                                <div>Объектов: {org.projects.length}</div>
                              </div>
                            </div>
                          </div>

                          {org.projects.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Участвует в объектах:</div>
                              <div className="flex flex-wrap gap-2">
                                {org.projects.map((project, index) => (
                                  <Badge key={index} variant="secondary">{project}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAssigningOrganization(org);
                              setSelectedObjectId(undefined);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Назначить на Объект
                          </Button>
                          <Link to={`/organizations/${org.id}/employees`}>
                            <Button variant="outline" size="sm">
                              <Users className="w-4 h-4 mr-2" />
                              Сотрудники
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Назначения по проектам</h3>
                <p className="text-gray-500">
                  Здесь будет отображаться информация о назначении организаций исполнителями по проектам
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Управление сотрудниками</h3>
                <p className="text-gray-500">
                  Здесь будет отображаться информация о сотрудниках организаций и их ролях в проектах
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Диалог назначения организации на объект */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Назначить на Объект</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">Организация</div>
                <div className="font-medium">{assigningOrganization?.name ?? '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Выберите объект</div>
                <Select value={selectedObjectId} onValueChange={setSelectedObjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите объект" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockObjects.map(obj => (
                      <SelectItem key={obj.id} value={obj.id}>{obj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (!assigningOrganization || !selectedObjectId) return;
                    const objectName = mockObjects.find(o => o.id === selectedObjectId)?.name;
                    if (!objectName) return;
                    handleAssignToObject(assigningOrganization.id, objectName);
                    setIsAssignDialogOpen(false);
                  }}
                  disabled={!assigningOrganization || !selectedObjectId}
                >
                  Назначить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {filteredOrganizations.length === 0 && activeTab === 'list' && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Организации не найдены</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
