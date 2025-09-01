import { useEffect, useMemo, useState } from 'react';
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
import { listProjects, getProjectDocuments, SimpleDocument, getProjectAssignees, AssigneeInfo } from '../../shared/api';

interface CommentItem {
  author: string;
  date: string;
  text: string;
}

interface HistoryItem {
  author: string;
  date: string;
  decision: string;
}

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
  relatedDocumentsDetailed?: { projectId: string; projectName: string; documents: string[] }[];
  dueDate: string;
  createdDate: string;
  completedDate?: string;
  comments: number;
  attachments: number;
  progress?: number;
  commentsList?: CommentItem[];
  history?: HistoryItem[];
}

const mockTasks: Task[] = [
  // Демо-поручение для Технического заказчика (черновик)
  {
    id: 'task-draft-demo',
    title: 'Подготовить перечень исходных данных',
    description: 'Сформировать перечень ИРД для стартового пакета по объекту',
    status: 'draft',
    priority: 'medium',
    assignee: 'Анна Смирнова',
    assigneeRole: 'Руководитель подразделения',
    creator: 'Анна Смирнова',
    creatorRole: 'Технический заказчик',
    projectName: 'ЖК «Северный парк»',
    projectId: '1',
    relatedDocuments: [],
    dueDate: '2025-12-31',
    createdDate: '2025-01-01',
    comments: 0,
    attachments: 0,
    commentsList: [],
    history: [
      { author: 'Система', date: '2025-01-01', decision: 'создано' }
    ]
  },
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
    progress: 65,
    commentsList: [
      { author: 'Анна Смирнова', date: '2024-01-20', text: 'Проверьте соответствие по разделу АР.' },
      { author: 'Петр Иванов', date: '2024-01-21', text: 'Замечания учту, подготовлю правки.' },
      { author: 'Анна Смирнова', date: '2024-01-22', text: 'Ок, жду обновления к утру.' }
    ],
    history: [
      { author: 'Анна Смирнова', date: '2024-01-20', decision: 'создано' },
      { author: 'Петр Иванов', date: '2024-01-21', decision: 'зафиксировано решение' },
      { author: 'Анна Смирнова', date: '2024-01-22', decision: 'отправлено на доработку' }
    ]
  },
  {
    id: 'task-2',
    title: 'Согласовать конструктивные решения',
    description: 'Рассмотреть и согласовать предложенные конструктивные решения фундамента',
    status: 'in-progress',
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
    progress: 90,
    commentsList: [
      { author: 'Анна Сидорова', date: '2024-01-18', text: 'Прошу согласовать раздел КР: фундамент.' },
      { author: 'Анна Смирнова', date: '2024-01-19', text: 'Нужны расчетные обоснования.' },
      { author: 'Анна Сидорова', date: '2024-01-20', text: 'Добавила пояснение и расчеты.' },
      { author: 'Анна Смирнова', date: '2024-01-21', text: 'Ок, на проверке.' },
      { author: 'Анна Сидорова', date: '2024-01-22', text: 'Готово.' }
    ],
    history: [
      { author: 'Анна Сидорова', date: '2024-01-18', decision: 'создано' },
      { author: 'Анна Смирнова', date: '2024-01-19', decision: 'отправлено на доработку' },
      { author: 'Анна Сидорова', date: '2024-01-20', decision: 'зафиксировано решение' }
    ]
  },
  {
    id: 'task-3',
    title: 'Внести исправления в схему отопления',
    description: 'По результатам согласования внести замечания в схему системы отопления',
    status: 'in-progress',
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
    ,
    commentsList: [
      { author: 'Михаил Козлов', date: '2024-01-16', text: 'Отмечу замечания по трассировке.' },
      { author: 'Анна Смирнова', date: '2024-01-17', text: 'Верните на согласование после исправлений.' },
      { author: 'Михаил Козлов', date: '2024-01-18', text: 'Исправлено, проверьте.' }
    ],
    history: [
      { author: 'Анна Смирнова', date: '2024-01-15', decision: 'создано' },
      { author: 'Михаил Козлов', date: '2024-01-18', decision: 'зафиксировано решение' }
    ]
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
    progress: 100,
    commentsList: [
      { author: 'Елена Волкова', date: '2024-01-18', text: 'Заключение приложено.' },
      { author: 'Дмитрий Петров', date: '2024-01-19', text: 'Подписал документ.' }
    ],
    history: [
      { author: 'Елена Волкова', date: '2024-01-10', decision: 'создано' },
      { author: 'Дмитрий Петров', date: '2024-01-19', decision: 'вопрос решен' }
    ]
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
    ,
    commentsList: [
      { author: 'Марсель Габдуллинов', date: '2024-01-21', text: 'Нужно проверить расчеты по ТП 10/0.4.' }
    ],
    history: [
      { author: 'Марсель Габдуллинов', date: '2024-01-21', decision: 'создано' }
    ]
  }
];

const statusConfig = {
  'draft': { label: 'Черновик', color: 'bg-gray-500', icon: Edit },
  'in-progress': { label: 'В работе', color: 'bg-blue-500', icon: Clock },
  'completed': { label: 'Выполнено', color: 'bg-green-500', icon: CheckCircle }
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
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [availableProjects, setAvailableProjects] = useState<Array<{id: string; name: string}>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [relatedDocs, setRelatedDocs] = useState<SimpleDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<Record<string, boolean>>({});
  const [assignees, setAssignees] = useState<AssigneeInfo[]>([]);
  // Доп. блоки выбора документов из других объектов
  const [extraSelections, setExtraSelections] = useState<Array<{
    projectId?: string;
    docs: SimpleDocument[];
    selected: Record<string, boolean>;
  }>>([]);

  useEffect(() => {
    setAvailableProjects(listProjects());
  }, []);

  useEffect(() => {
    const loadDocs = async () => {
      if (!selectedProjectId) { setRelatedDocs([]); setSelectedDocIds({}); return; }
      const docs = await getProjectDocuments(selectedProjectId);
      setRelatedDocs(docs);
      const initial: Record<string, boolean> = {};
      docs.forEach(d => initial[d.id] = false);
      setSelectedDocIds(initial);
    };
    const loadAssignees = async () => {
      if (!selectedProjectId) { setAssignees([]); setFormAssignee(undefined); return; }
      const list = await getProjectAssignees(selectedProjectId);
      setAssignees(list);
      const rpp = list.find(a => a.isRpp);
      setFormAssignee(rpp?.id);
    };
    loadDocs();
    loadAssignees();
  }, [selectedProjectId]);

  const addExtraSelection = () => {
    setExtraSelections(prev => [...prev, { projectId: undefined, docs: [], selected: {} }]);
  };

  const updateExtraProject = async (idx: number, projectId: string) => {
    const docs = await getProjectDocuments(projectId);
    const selected: Record<string, boolean> = {};
    docs.forEach(d => selected[d.id] = false);
    setExtraSelections(prev => prev.map((b, i) => i === idx ? { projectId, docs, selected } : b));
  };

  const toggleExtraDoc = (idx: number, docId: string, checked: boolean) => {
    setExtraSelections(prev => prev.map((b, i) => i === idx ? { ...b, selected: { ...b.selected, [docId]: checked } } : b));
  };

  const filteredTasks = tasks.filter(task => {
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
        // входящие поручения на меня (исключая черновики)
        return filteredTasks.filter(task => task.assignee === currentUser.name && task.status !== 'draft');
      case 'created-by-me':
        return filteredTasks.filter(task => task.creator === currentUser.name);
      default:
        return filteredTasks;
    }
  };

  const tabTasks = getTabTasks();

  const canCreateTask = ['project-manager', 'customer', 'company-admin', 'root-admin'].includes(currentUser.role);

  // Поля формы создания поручения
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignee, setFormAssignee] = useState<string | undefined>(undefined);
  const [formDueDate, setFormDueDate] = useState<string>('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);

  const handleCreateTask = () => {
    if (!formTitle || !formDescription || !formAssignee || !formDueDate || !selectedProjectId) {
      console.log('Заполните обязательные поля');
      return;
    }
    const projectName = availableProjects.find(p => p.id === selectedProjectId)?.name || '';
    const assigneeName = assignees.find(a => a.id === formAssignee)?.name || '';
    const assigneeRole = assignees.find(a => a.id === formAssignee)?.role || '';
    const selectedDocsMain = relatedDocs.filter(d => selectedDocIds[d.id]);
    const detailed: { projectId: string; projectName: string; documents: string[] }[] = [];
    if (selectedDocsMain.length > 0 && selectedProjectId) {
      detailed.push({ projectId: selectedProjectId, projectName, documents: selectedDocsMain.map(d => d.name) });
    }
    extraSelections.forEach(block => {
      if (!block.projectId) return;
      const docs = block.docs.filter(d => block.selected[d.id]).map(d => d.name);
      if (docs.length > 0) {
        const pname = availableProjects.find(p => p.id === block.projectId)?.name || '';
        detailed.push({ projectId: block.projectId, projectName: pname, documents: docs });
      }
    });
    const selectedDocs = detailed.flatMap(g => g.documents);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      status: 'draft',
      priority: formPriority || 'medium',
      assignee: assigneeName,
      assigneeRole: assigneeRole || 'Исполнитель',
      creator: currentUser.name,
      creatorRole: 'Создатель',
      projectName,
      projectId: selectedProjectId,
      relatedDocuments: selectedDocs,
      relatedDocumentsDetailed: detailed,
      dueDate: formDueDate,
      createdDate: new Date().toISOString().slice(0, 10),
      comments: 0,
      attachments: 0,
      progress: 0,
      commentsList: [],
      history: [
        { author: currentUser.name, date: new Date().toISOString().slice(0,10), decision: 'создано' }
      ]
    } as Task;
    setTasks(prev => [newTask, ...prev]);
    setIsCreateDialogOpen(false);
    // reset form
    setFormTitle('');
    setFormDescription('');
    setFormAssignee(undefined);
    setFormDueDate('');
    setFormPriority(undefined);
    setSelectedProjectId(undefined);
    setRelatedDocs([]);
    setSelectedDocIds({});
  };

  const stats = {
    total: tasks.length,
    myTasks: tasks.filter(t => t.assignee === currentUser.name && t.status !== 'draft').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const sendToWork = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextHistory = (t.history || []).concat({ author: currentUser.name, date: new Date().toISOString().slice(0,10), decision: 'отправлено в работу' });
      return { ...t, status: 'in-progress', history: nextHistory };
    }));
  };

  const markCompleted = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextHistory = (t.history || []).concat({ author: currentUser.name, date: new Date().toISOString().slice(0,10), decision: 'вопрос решен' });
      return { ...t, status: 'completed', completedDate: new Date().toISOString().slice(0,10), history: nextHistory };
    }));
  };

  const markResolvedByAssignee = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextHistory = (t.history || []).concat({ author: currentUser.name, date: new Date().toISOString().slice(0,10), decision: 'зафиксировано решение' });
      return { ...t, history: nextHistory };
    }));
  };

  const sendBackForRework = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextHistory = (t.history || []).concat({ author: currentUser.name, date: new Date().toISOString().slice(0,10), decision: 'отправлено на доработку' });
      return { ...t, history: nextHistory };
    }));
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
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <List className="w-5 h-5" />
                    <span>Создание поручения</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="taskTitle">Заголовок поручения *</Label>
                    <Input id="taskTitle" placeholder="Краткое описание задачи..." value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="taskDescription">Описание *</Label>
                    <Textarea id="taskDescription" placeholder="Подробное описание поручения..." rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project">Объект *</Label>
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите объект" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProjects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Срок выполнения *</Label>
                      <Input id="dueDate" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignee">Исполнитель *</Label>
                      <Select value={formAssignee} onValueChange={setFormAssignee} disabled={!selectedProjectId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите исполнителя" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignees.map(a => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} {a.isRpp ? '(РПП)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Приоритет</Label>
                      <Select value={formPriority} onValueChange={(v) => setFormPriority(v as 'low' | 'medium' | 'high')}>
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
                    <div className="border rounded-md p-3 max-h-56 overflow-y-auto">
                      {selectedProjectId ? (
                        relatedDocs.length > 0 ? (
                          relatedDocs.map(doc => (
                            <label key={doc.id} className="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                checked={!!selectedDocIds[doc.id]}
                                onChange={(e) => setSelectedDocIds(prev => ({ ...prev, [doc.id]: e.target.checked }))}
                              />
                              <span className="text-sm">{doc.name}</span>
                            </label>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500">Документы не найдены</div>
                        )
                      ) : (
                        <div className="text-xs text-gray-500">Сначала выберите объект</div>
                      )}
                    </div>
                  </div>

                  {/* Дополнительные источники документов */}
                  {extraSelections.map((block, idx) => (
                    <div key={idx} className="border rounded-md p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Доп. объект</Label>
                          <Select value={block.projectId} onValueChange={(v) => updateExtraProject(idx, v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите объект" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProjects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {block.projectId ? (
                          block.docs.length > 0 ? (
                            block.docs.map(doc => (
                              <label key={doc.id} className="flex items-center space-x-2 py-1">
                                <input type="checkbox" checked={!!block.selected[doc.id]} onChange={(e) => toggleExtraDoc(idx, doc.id, e.target.checked)} />
                                <span className="text-sm">{doc.name}</span>
                              </label>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500">Документы не найдены</div>
                          )
                        ) : (
                          <div className="text-xs text-gray-500">Сначала выберите объект</div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addExtraSelection}>Добавить файлы из другого Объекта</Button>

                  {/* Итоговый список выбранных файлов */}
                  <div className="pt-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">Выбрано документов:</div>
                    <div className="text-xs text-gray-700 space-y-1">
                      {selectedProjectId && Object.values(selectedDocIds).some(Boolean) && (
                        <div>
                          <div className="font-medium">{availableProjects.find(p => p.id === selectedProjectId)?.name}</div>
                          {relatedDocs.filter(d => selectedDocIds[d.id]).map(d => (
                            <div key={d.id}>- {d.name}</div>
                          ))}
                        </div>
                      )}
                      {extraSelections.map((block, idx) => (
                        block.projectId && Object.values(block.selected).some(Boolean) ? (
                          <div key={`sum-${idx}`}>
                            <div className="font-medium">{availableProjects.find(p => p.id === block.projectId)?.name}</div>
                            {block.docs.filter(d => block.selected[d.id]).map(d => (
                              <div key={d.id}>- {d.name}</div>
                            ))}
                          </div>
                        ) : null
                      ))}
                      {!(selectedProjectId && Object.values(selectedDocIds).some(Boolean)) && extraSelections.every(b => !b.projectId || !Object.values(b.selected).some(Boolean)) && (
                        <div className="text-gray-500">Пока ничего не выбрано</div>
                      )}
                    </div>
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
                      <SelectItem value="Северный">ЖК «Северный парк»</SelectItem>
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

                          
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            <Link to={`/tasks/${task.id}`} state={{ task }} className="inline-flex items-center">Открыть</Link>
                          </Button>
                          {/* Убрали кнопку Редактировать по требованию */}
                          {task.status === 'draft' && task.creator === currentUser.name && (
                            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => sendToWork(task.id)}>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Отправить в работу
                            </Button>
                          )}
                          {task.status === 'in-progress' && task.creator === currentUser.name && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => markCompleted(task.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Завершить
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => sendBackForRework(task.id)}>
                                Отправить на доработку
                              </Button>
                            </>
                          )}
                          {task.status === 'in-progress' && task.assignee === currentUser.name && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => markResolvedByAssignee(task.id)}>
                              Отправить на проверку
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
