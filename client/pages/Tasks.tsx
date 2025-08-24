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
import { useRole } from '../contexts/RoleContext';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  List, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  Building2,
  FileText,
  Filter,
  Eye,
  Edit,
  MessageSquare,
  ArrowRight,
  Flag,
  Users
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in-progress' | 'under-review' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  assigneeRole: string;
  creator: string;
  creatorRole: string;
  projectName: string;
  projectId: string;
  relatedDocuments: string[];
  dueDate: string;
  createdDate: string;
  completedDate?: string;
  comments: number;
  attachments: number;
  progress?: number;
}

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Проверить архитектурные решения',
    description: 'Необходимо проверить соответствие архитектурных планов техническому заданию и нормативным требованиям',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Петр Иванов',
    assigneeRole: 'Главный архитектор',
    creator: 'Анна Смирнова',
    creatorRole: 'Технический директор',
    projectName: 'ЖК «Северный парк»',
    projectId: '1',
    relatedDocuments: ['Архитектурные решения - Планы этажей'],
    dueDate: '2024-01-25',
    createdDate: '2024-01-20',
    comments: 3,
    attachments: 2,
    progress: 65
  },
  {
    id: 'task-2',
    title: 'Согла��овать конструктивные решения',
    description: 'Рассмотреть и согласовать предложенные конструктивные решения фундамента',
    status: 'under-review',
    priority: 'medium',
    assignee: 'Анна Смирнова',
    assigneeRole: 'Технический директор',
    creator: 'Анна Сидорова',
    creatorRole: 'Инженер-конструктор',
    projectName: 'БЦ «Технологический»',
    projectId: '2',
    relatedDocuments: ['Конструктивные решения - Фундамент'],
    dueDate: '2024-01-23',
    createdDate: '2024-01-18',
    comments: 5,
    attachments: 1,
    progress: 90
  },
  {
    id: 'task-3',
    title: 'Внести исправления в схему отопления',
    description: 'По результатам согласования внести замечания в схему системы отопления',
    status: 'overdue',
    priority: 'high',
    assignee: 'Михаил Козлов',
    assigneeRole: 'Инженер ОВ',
    creator: 'Анна Смирнова',
    creatorRole: 'Технический директор',
    projectName: 'ЖК «Северный парк»',
    projectId: '1',
    relatedDocuments: ['Система отопления - Схемы'],
    dueDate: '2024-01-22',
    createdDate: '2024-01-15',
    comments: 8,
    attachments: 3
  },
  {
    id: 'task-4',
    title: 'Подготовить заключение экспертизы',
    description: 'Оформить итоговое заключение по результатам государственной экспертизы',
    status: 'completed',
    priority: 'medium',
    assignee: 'Дмитрий Петров',
    assigneeRole: 'Эксперт',
    creator: 'Елена Волкова',
    creatorRole: 'Менеджер проекта',
    projectName: 'ТРК «Галерея»',
    projectId: '3',
    relatedDocuments: ['Заключение экспертизы'],
    dueDate: '2024-01-20',
    createdDate: '2024-01-10',
    completedDate: '2024-01-19',
    comments: 2,
    attachments: 1,
    progress: 100
  },
  {
    id: 'task-5',
    title: 'Проверить расчеты электроснабжения',
    description: 'Выполнить проверку расчетов нагрузок и схем электроснабжения',
    status: 'draft',
    priority: 'low',
    assignee: 'Ольга Смирнова',
    assigneeRole: 'Инженер-электрик',
    creator: 'Марсель Габдуллинов',
    creatorRole: 'Менеджер проекта',
    projectName: 'БЦ «Технологический»',
    projectId: '2',
    relatedDocuments: ['Электроснабжение - Схемы питания'],
    dueDate: '2024-01-28',
    createdDate: '2024-01-21',
    comments: 0,
    attachments: 0
  }
];

const statusConfig = {
  'draft': { label: 'Черновик', color: 'bg-gray-500', icon: Edit },
  'in-progress': { label: 'В работе', color: 'bg-blue-500', icon: Clock },
  'under-review': { label: 'На проверке', color: 'bg-yellow-500', icon: Eye },
  'completed': { label: 'Выполнено', color: 'bg-green-500', icon: CheckCircle },
  'cancelled': { label: 'Отменено', color: 'bg-gray-600', icon: XCircle },
  'overdue': { label: 'Просрочено', color: 'bg-red-500', icon: AlertCircle }
};

const priorityConfig = {
  'low': { label: 'Низкий', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  'medium': { label: 'Средний', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  'high': { label: 'Высокий', color: 'text-red-600', bgColor: 'bg-red-100' }
};

export default function Tasks() {
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all-tasks');

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;
    const matchesProject = projectFilter === 'all' || task.projectName.includes(projectFilter);
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesProject;
  });

  // Фильтруем задачи в зависимости от активной вкладки
  const getTabTasks = () => {
    switch (activeTab) {
      case 'my-tasks':
        return filteredTasks.filter(task => task.assignee === currentUser.name);
      case 'created-by-me':
        return filteredTasks.filter(task => task.creator === currentUser.name);
      case 'overdue':
        return filteredTasks.filter(task => task.status === 'overdue');
      case 'under-review':
        return filteredTasks.filter(task => task.status === 'under-review');
      default:
        return filteredTasks;
    }
  };

  const tabTasks = getTabTasks();

  const canCreateTask = ['project-manager', 'customer', 'company-admin', 'root-admin'].includes(currentUser.role);

  const handleCreateTask = () => {
    console.log('Creating new task');
    setIsCreateDialogOpen(false);
  };

  const stats = {
    total: mockTasks.length,
    myTasks: mockTasks.filter(t => t.assignee === currentUser.name).length,
    inProgress: mockTasks.filter(t => t.status === 'in-progress').length,
    overdue: mockTasks.filter(t => t.status === 'overdue').length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
    underReview: mockTasks.filter(t => t.status === 'under-review').length
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Поручения</h1>
            <p className="text-gray-600 mt-1">
              Создание, назначение и отслеживание выполнения поручений
            </p>
          </div>
          {canCreateTask && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Создать поручение</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <List className="w-5 h-5" />
                    <span>Создание поручения</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="taskTitle">Заголовок поручения *</Label>
                    <Input id="taskTitle" placeholder="Краткое описание задачи..." />
                  </div>
                  <div>
                    <Label htmlFor="taskDescription">Описание *</Label>
                    <Textarea id="taskDescription" placeholder="Подробное описание поручения..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignee">Исполнитель *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите исполнителя" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petrov">Петр Иванов</SelectItem>
                          <SelectItem value="sidorova">Анна Сидорова</SelectItem>
                          <SelectItem value="kozlov">Михаил Козлов</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Срок выполнения *</Label>
                      <Input id="dueDate" type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project">Объект *</Label>
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
                    <div>
                      <Label htmlFor="priority">Приоритет</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите приоритет" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="documents">Связанные документы</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите документы (необязательно)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doc-1">Архитектурные решения - Планы этажей</SelectItem>
                        <SelectItem value="doc-2">Конструктивные решения - Фундамент</SelectItem>
                        <SelectItem value="doc-3">Система отопления - Схемы</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleCreateTask}>
                      Создать поручение
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего поручений</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{stats.myTasks}</div>
              <div className="text-sm text-gray-600">Мои задачи</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">В работе</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
              <div className="text-sm text-gray-600">На проверке</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">Просроченных</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Завершенных</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all-tasks">Все поручения</TabsTrigger>
            <TabsTrigger value="my-tasks">Мои задачи ({stats.myTasks})</TabsTrigger>
            <TabsTrigger value="created-by-me">Созданные мной</TabsTrigger>
            <TabsTrigger value="overdue">Просроченные ({stats.overdue})</TabsTrigger>
            <TabsTrigger value="under-review">На проверке ({stats.underReview})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск поручений..."
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
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="in-progress">В работе</SelectItem>
                      <SelectItem value="under-review">На проверке</SelectItem>
                      <SelectItem value="completed">Выполнено</SelectItem>
                      <SelectItem value="overdue">Просрочено</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Все приоритеты" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все приоритеты</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="low">Низкий</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Все проекты" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все проекты</SelectItem>
                      <SelectItem value="Северный">ЖК «Север��ый парк»</SelectItem>
                      <SelectItem value="Технологический">БЦ «Технологический»</SelectItem>
                      <SelectItem value="Галерея">ТРК «Галерея»</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <div className="space-y-4">
              {tabTasks.map((task) => {
                const statusInfo = statusConfig[task.status];
                const priorityInfo = priorityConfig[task.priority];
                const StatusIcon = statusInfo.icon;
                const overdue = isOverdue(task.dueDate);

                return (
                  <Card key={task.id} className={`hover:shadow-lg transition-shadow ${task.status === 'overdue' ? 'border-red-200' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold">{task.title}</h3>
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge className={`${priorityInfo.bgColor} ${priorityInfo.color}`}>
                              <Flag className="w-3 h-3 mr-1" />
                              {priorityInfo.label}
                            </Badge>
                            {overdue && task.status !== 'completed' && (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Просрочено
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4">{task.description}</p>

                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Участники</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <User className="w-3 h-3 mr-2 text-gray-400" />
                                  <span className="font-medium">Исполнитель:</span>
                                  <span className="ml-1">{task.assignee}</span>
                                </div>
                                <div className="text-xs text-gray-500 ml-5">{task.assigneeRole}</div>
                                <div className="flex items-center mt-2">
                                  <User className="w-3 h-3 mr-2 text-gray-400" />
                                  <span className="font-medium">Создатель:</span>
                                  <span className="ml-1">{task.creator}</span>
                                </div>
                                <div className="text-xs text-gray-500 ml-5">{task.creatorRole}</div>
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Проект и сроки</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Building2 className="w-3 h-3 mr-2 text-gray-400" />
                                  {task.projectName}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                  Создано: {task.createdDate}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                  <span className={overdue && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                                    Срок: {task.dueDate}
                                  </span>
                                </div>
                                {task.completedDate && (
                                  <div className="flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                    Завершено: {task.completedDate}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Активность</div>
                              <div className="space-y-1 text-sm">
                                {task.comments > 0 && (
                                  <div className="flex items-center">
                                    <MessageSquare className="w-3 h-3 mr-2 text-gray-400" />
                                    {task.comments} комментариев
                                  </div>
                                )}
                                {task.attachments > 0 && (
                                  <div className="flex items-center">
                                    <FileText className="w-3 h-3 mr-2 text-gray-400" />
                                    {task.attachments} файлов
                                  </div>
                                )}
                                {task.relatedDocuments.length > 0 && (
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Связанные документы:</div>
                                    {task.relatedDocuments.map((doc, index) => (
                                      <div key={index} className="text-xs text-blue-600 truncate">
                                        {doc}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {task.progress !== undefined && task.status !== 'completed' && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Прогресс выполнения</span>
                                <span className="font-medium">{task.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all" 
                                  style={{width: `${task.progress}%`}}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Открыть
                          </Button>
                          {(task.assignee === currentUser.name || task.creator === currentUser.name) && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Редактировать
                            </Button>
                          )}
                          {task.status === 'in-progress' && task.assignee === currentUser.name && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              На проверку
                            </Button>
                          )}
                          {task.status === 'under-review' && task.creator === currentUser.name && (
                            <Button size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Принять
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {tabTasks.length === 0 && (
              <div className="text-center py-12">
                <List className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Поручения не найдены</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
