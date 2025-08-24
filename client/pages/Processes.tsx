import { useState } from 'react';
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
import { useRole } from '../contexts/RoleContext';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  List, 
  Settings,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  Edit,
  Trash2,
  Play,
  Pause,
  FileText,
  Building2,
  User,
  Calendar,
  Shield,
  Eye,
  PenTool,
  Workflow
} from 'lucide-react';

interface Process {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'review' | 'custom';
  status: 'active' | 'draft' | 'archived';
  steps: number;
  projectsCount: number;
  documentsProcessed: number;
  createdDate: string;
  lastUsed?: string;
  isTemplate: boolean;
  averageTime: string;
}

interface ProcessStep {
  id: string;
  name: string;
  order: number;
  participants: Participant[];
  timeLimit: number; // в днях
  isRequired: boolean;
  canFinishOnThis: boolean;
  canSkip: boolean;
  autoReject: boolean;
  rules: StepRule[];
}

interface Participant {
  id: string;
  name: string;
  role: string;
  type: 'user' | 'group';
  isRequired: boolean;
}

interface StepRule {
  id: string;
  type: 'all_required' | 'can_finish' | 'can_configure_next' | 'can_set_status' | 'blocking' | 'auto_reject';
  enabled: boolean;
  description: string;
}

const mockProcesses: Process[] = [
  {
    id: 'proc-1',
    name: 'Стандартное согласование ПД',
    description: 'Базовый процесс согласования проектной документации в 2 шага',
    type: 'approval',
    status: 'active',
    steps: 2,
    projectsCount: 5,
    documentsProcessed: 124,
    createdDate: '2024-01-10',
    lastUsed: '2024-01-22',
    isTemplate: true,
    averageTime: '7-10 дней'
  },
  {
    id: 'proc-2',
    name: 'Быстрое согласование',
    description: 'Ускоренный процесс согласования в 1 шаг для типовых документов',
    type: 'approval',
    status: 'active',
    steps: 1,
    projectsCount: 3,
    documentsProcessed: 45,
    createdDate: '2024-01-15',
    lastUsed: '2024-01-21',
    isTemplate: true,
    averageTime: '3-5 дней'
  },
  {
    id: 'proc-3',
    name: 'Расширенное согласование экспертизы',
    description: 'Детальный процесс для согласования результатов экспертизы в 4 шага',
    type: 'review',
    status: 'active',
    steps: 4,
    projectsCount: 2,
    documentsProcessed: 28,
    createdDate: '2024-01-08',
    lastUsed: '2024-01-20',
    isTemplate: true,
    averageTime: '14-20 дней'
  },
  {
    id: 'proc-4',
    name: 'Согласование для ЖК Северный парк',
    description: 'Специализированный процесс для конкретного объекта',
    type: 'custom',
    status: 'active',
    steps: 3,
    projectsCount: 1,
    documentsProcessed: 67,
    createdDate: '2024-01-12',
    lastUsed: '2024-01-22',
    isTemplate: false,
    averageTime: '8-12 дней'
  },
  {
    id: 'proc-5',
    name: 'Процесс согласования ИРД',
    description: 'Процесс для согласования исходно-разрешительной документации',
    type: 'approval',
    status: 'draft',
    steps: 2,
    projectsCount: 0,
    documentsProcessed: 0,
    createdDate: '2024-01-21',
    isTemplate: true,
    averageTime: 'Не определено'
  }
];

const mockSteps: ProcessStep[] = [
  {
    id: 'step-1',
    name: 'Проверка ГИП',
    order: 1,
    participants: [
      { id: 'user-1', name: 'Петр Иванов', role: 'ГИП', type: 'user', isRequired: true },
      { id: 'user-2', name: 'Анна Сидорова', role: 'Заместитель ГИП', type: 'user', isRequired: false }
    ],
    timeLimit: 3,
    isRequired: true,
    canFinishOnThis: false,
    canSkip: false,
    autoReject: true,
    rules: [
      { id: 'rule-1', type: 'all_required', enabled: true, description: 'Требуется проверка всех участников шага' },
      { id: 'rule-2', type: 'can_configure_next', enabled: true, description: 'Возможность настраивать следующий шаг при переходе к нему' },
      { id: 'rule-3', type: 'auto_reject', enabled: true, description: 'Отклонение при несогласовании' }
    ]
  },
  {
    id: 'step-2',
    name: 'Согласование заказчика',
    order: 2,
    participants: [
      { id: 'user-3', name: 'Анна Смирнова', role: 'Технический директор', type: 'user', isRequired: true },
      { id: 'group-1', name: 'Группа согласования', role: 'Согласующие', type: 'group', isRequired: false }
    ],
    timeLimit: 5,
    isRequired: true,
    canFinishOnThis: true,
    canSkip: false,
    autoReject: false,
    rules: [
      { id: 'rule-4', type: 'all_required', enabled: false, description: 'Требуется проверка всех участников шага' },
      { id: 'rule-5', type: 'can_finish', enabled: true, description: 'Возможность завершить согласование на текущем шаге' },
      { id: 'rule-6', type: 'can_set_status', enabled: true, description: 'Возможность проставить статус согласования' }
    ]
  }
];

const statusConfig = {
  'active': { label: 'Активен', color: 'bg-green-500', icon: CheckCircle },
  'draft': { label: 'Черновик', color: 'bg-gray-500', icon: Edit },
  'archived': { label: 'Архивирован', color: 'bg-yellow-500', icon: AlertCircle }
};

const typeConfig = {
  'approval': { label: 'Согласование документов', color: 'bg-blue-500', icon: FileText },
  'review': { label: 'Рассмотрение и проверка', color: 'bg-purple-500', icon: Eye },
  'custom': { label: 'Специализированный', color: 'bg-orange-500', icon: Settings }
};

export default function Processes() {
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const filteredProcesses = mockProcesses.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    const matchesType = typeFilter === 'all' || process.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateProcess = () => {
    console.log('Creating new process');
    setIsCreateDialogOpen(false);
  };

  const handleDuplicateProcess = (processId: string) => {
    console.log('Duplicating process:', processId);
  };

  const handleArchiveProcess = (processId: string) => {
    console.log('Archiving process:', processId);
  };

  const stats = {
    total: mockProcesses.length,
    active: mockProcesses.filter(p => p.status === 'active').length,
    templates: mockProcesses.filter(p => p.isTemplate).length,
    draft: mockProcesses.filter(p => p.status === 'draft').length,
    totalDocuments: mockProcesses.reduce((sum, p) => sum + p.documentsProcessed, 0)
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Процессы согласования</h1>
            <p className="text-gray-600 mt-1">
              Конструктор рабочих процессов согласования документов
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Создать процесс</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Workflow className="w-5 h-5" />
                  <span>Создание процесса согласования</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Основная информация</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="processType">Тип рабочего процесса *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approval">Согласование документов</SelectItem>
                          <SelectItem value="review">Рассмотрение и проверка</SelectItem>
                          <SelectItem value="custom">Специализированный</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="processSteps">Количество шагов *</Label>
                      <Input type="number" min="1" max="10" defaultValue="2" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="processName">Название процесса *</Label>
                    <Input id="processName" placeholder="Например, 'Согласование проектной документации'" />
                  </div>
                  <div>
                    <Label htmlFor="processDescription">Описание</Label>
                    <Textarea id="processDescription" placeholder="Краткое описание процесса..." rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="processProject">Привязка к объекту</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите объект (необязательно)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project-1">ЖК «Северный парк»</SelectItem>
                        <SelectItem value="project-2">БЦ «Технологический»</SelectItem>
                        <SelectItem value="project-3">ТРК «Галерея»</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Creation Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Способ создания</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-blue-500">
                      <CardContent className="p-4 text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <h4 className="font-medium mb-1">Создать с нуля</h4>
                        <p className="text-sm text-gray-600">Настроить все шаги вручную</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                        <h4 className="font-medium mb-1">Использовать шаблон</h4>
                        <p className="text-sm text-gray-600">На основе готового шаблона</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <Copy className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <h4 className="font-medium mb-1">Копировать существующий</h4>
                        <p className="text-sm text-gray-600">Дублировать готовый процесс</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreateProcess}>
                    Создать процесс
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего процессов</div>
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
              <div className="text-2xl font-bold text-purple-600">{stats.templates}</div>
              <div className="text-sm text-gray-600">Шаблонов</div>
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
              <div className="text-2xl font-bold text-orange-600">{stats.totalDocuments}</div>
              <div className="text-sm text-gray-600">Документов обработано</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Список процессов</TabsTrigger>
            <TabsTrigger value="templates">Шаблоны</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск процессов..."
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
                      <SelectItem value="draft">Черновики</SelectItem>
                      <SelectItem value="archived">Архивированные</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="approval">Согласование</SelectItem>
                      <SelectItem value="review">Рассмотрение</SelectItem>
                      <SelectItem value="custom">Специализированный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Processes List */}
            <div className="space-y-4">
              {filteredProcesses.map((process) => {
                const statusInfo = statusConfig[process.status];
                const typeInfo = typeConfig[process.type];
                const StatusIcon = statusInfo.icon;
                const TypeIcon = typeInfo.icon;

                return (
                  <Card key={process.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Workflow className="w-6 h-6 text-gray-400" />
                            <h3 className="text-xl font-semibold">{process.name}</h3>
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge className={`${typeInfo.color} text-white`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                            {process.isTemplate && (
                              <Badge variant="outline">
                                <FileText className="w-3 h-3 mr-1" />
                                Шаблон
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4">{process.description}</p>

                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Конфигурация</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <List className="w-3 h-3 mr-2 text-gray-400" />
                                  {process.steps} шагов
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-2 text-gray-400" />
                                  {process.averageTime}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Использование</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Building2 className="w-3 h-3 mr-2 text-gray-400" />
                                  {process.projectsCount} проектов
                                </div>
                                <div className="flex items-center">
                                  <FileText className="w-3 h-3 mr-2 text-gray-400" />
                                  {process.documentsProcessed} документов
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Даты</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                  Создан: {process.createdDate}
                                </div>
                                {process.lastUsed && (
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-2 text-gray-400" />
                                    Использован: {process.lastUsed}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button variant="outline" size="sm" onClick={() => setSelectedProcess(process)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDuplicateProcess(process.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Дублировать
                          </Button>
                          {process.status === 'active' ? (
                            <Button variant="outline" size="sm">
                              <Pause className="w-4 h-4 mr-2" />
                              Деактивировать
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Play className="w-4 h-4 mr-2" />
                              Активировать
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleArchiveProcess(process.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Архивировать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Шаблоны процессов</h3>
                <p className="text-gray-500">
                  Готовые шаблоны процессов согласования для быстрого создания
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Аналитика процессов</h3>
                <p className="text-gray-500">
                  Статистика использования процессов, время выполнения, эффективность
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredProcesses.length === 0 && activeTab === 'list' && (
          <div className="text-center py-12">
            <Workflow className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Процессы не найдены</p>
          </div>
        )}

        {/* Process Step Configuration Dialog */}
        {selectedProcess && (
          <Dialog open={selectedProcess !== null} onOpenChange={() => setSelectedProcess(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Редактирование процесса: {selectedProcess.name}</span>
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="steps" className="w-full">
                <TabsList>
                  <TabsTrigger value="steps">Шаги процесса</TabsTrigger>
                  <TabsTrigger value="settings">Общие настройки</TabsTrigger>
                  <TabsTrigger value="participants">Участники</TabsTrigger>
                </TabsList>

                <TabsContent value="steps" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Настройка шагов</h3>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить шаг
                      </Button>
                    </div>
                    
                    {mockSteps.map((step, index) => (
                      <Card key={step.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                                {step.order}
                              </span>
                              {step.name}
                            </CardTitle>
                            <Badge variant={step.isRequired ? 'default' : 'secondary'}>
                              {step.isRequired ? 'Обязательный' : 'Опциональный'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Участники шага</h4>
                              <div className="space-y-2">
                                {step.participants.map((participant) => (
                                  <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center space-x-2">
                                      {participant.type === 'user' ? (
                                        <User className="w-4 h-4 text-gray-500" />
                                      ) : (
                                        <Users className="w-4 h-4 text-gray-500" />
                                      )}
                                      <div>
                                        <div className="text-sm font-medium">{participant.name}</div>
                                        <div className="text-xs text-gray-500">{participant.role}</div>
                                      </div>
                                    </div>
                                    <Badge variant={participant.isRequired ? 'default' : 'secondary'} className="text-xs">
                                      {participant.isRequired ? 'Обязательный' : 'Опциональный'}
                                    </Badge>
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" className="w-full">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Добавить участника
                                </Button>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Правила шага</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Время согласования</span>
                                  <span className="text-sm font-medium">{step.timeLimit} дней</span>
                                </div>
                                
                                {step.rules.map((rule) => (
                                  <div key={rule.id} className="flex items-center space-x-2">
                                    <Checkbox checked={rule.enabled} />
                                    <span className="text-sm">{rule.description}</span>
                                  </div>
                                ))}
                                
                                <div className="pt-2 border-t border-gray-200">
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Редактировать
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Copy className="w-4 h-4 mr-2" />
                                      Дублировать
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Общие настройки процесса</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Название процесса</Label>
                        <Input defaultValue={selectedProcess.name} />
                      </div>
                      <div>
                        <Label>Тип процесса</Label>
                        <Select defaultValue={selectedProcess.type}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approval">Согласование документов</SelectItem>
                            <SelectItem value="review">Рассмотрение и проверка</SelectItem>
                            <SelectItem value="custom">Специализированный</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Описание</Label>
                      <Textarea defaultValue={selectedProcess.description} rows={3} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="participants" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Управление участниками</h3>
                    <p className="text-gray-500">
                      Здесь будет интерфейс для управления участниками процесса и наблюдателями
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
