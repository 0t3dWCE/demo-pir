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
import { getProjectCompanies, getProjectEmployees, getEmployeesForCompanies, listProjects } from '../../shared/api';
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

type NewStepForm = {
  tempId: string;
  name: string;
  timeLimit: number;
  isRequired: boolean;
  canFinishOnThis: boolean;
  canSkip: boolean;
  autoReject: boolean;
  participants: Participant[];
  requireAllParticipants: boolean;
};

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
  const [processes, setProcesses] = useState<Process[]>(mockProcesses);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [processToDuplicate, setProcessToDuplicate] = useState<Process | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [creationOption, setCreationOption] = useState<'new' | 'template' | 'copy'>('new');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [selectedCopyId, setSelectedCopyId] = useState<string | undefined>(undefined);
  const [createType, setCreateType] = useState<'approval' | 'review' | 'custom' | ''>('');
  const [createStepsCount, setCreateStepsCount] = useState<number>(2);
  const [createName, setCreateName] = useState<string>('');
  const [createDescription, setCreateDescription] = useState<string>('');
  const [createProject, setCreateProject] = useState<string | undefined>(undefined);

  const initialStepsMap: Record<string, ProcessStep[]> = {
    'proc-1': mockSteps,
    'proc-2': mockSteps.slice(0, 1),
    'proc-3': mockSteps,
    'proc-4': mockSteps.slice(0, 2),
    'proc-5': []
  };
  const [processStepsMap, setProcessStepsMap] = useState<Record<string, ProcessStep[]>>(initialStepsMap);
  const [processInitialCreateForms, setProcessInitialCreateForms] = useState<Record<string, number>>({});
  const [draftStepsMap, setDraftStepsMap] = useState<Record<string, NewStepForm[]>>({});
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);
  const [assigneePickerContext, setAssigneePickerContext] = useState<{ processId: string; draftIndex: number } | null>(null);
  const [assigneePickerMode, setAssigneePickerMode] = useState<'company' | 'project'>('company');
  const [availableEmployees, setAvailableEmployees] = useState<Array<{ id: string; name: string; company: string }>>([]);
  const [selectedEmployeesIds, setSelectedEmployeesIds] = useState<string[]>([]);
  const [pickerCompanies, setPickerCompanies] = useState<Array<{ inn: string; name: string }>>([]);
  const [pickerProjects, setPickerProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [pickerCompanyMap, setPickerCompanyMap] = useState<Record<string, any>>({});
  const [editingSteps, setEditingSteps] = useState<Record<string, Record<number, {
    name: string;
    timeLimit: number;
    isRequired: boolean;
    canFinishOnThis: boolean;
    canSkip: boolean;
    autoReject: boolean;
    requireAll: boolean;
  }>>>({});

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    const matchesType = typeFilter === 'all' || process.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const createEmptySteps = (count: number): ProcessStep[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: `step-new-${index + 1}-${Date.now()}`,
      name: `Шаг ${index + 1}`,
      order: index + 1,
      participants: [],
      timeLimit: 3,
      isRequired: true,
      canFinishOnThis: index + 1 === count,
      canSkip: false,
      autoReject: false,
      rules: []
    }));
  };

  const handleCreateProcess = () => {
    const id = `proc-${Date.now()}`;

    let sourceProcess: Process | undefined = undefined;
    let stepsForProcess: ProcessStep[] = [];
    if (creationOption === 'template' && selectedTemplateId) {
      sourceProcess = processes.find(p => p.id === selectedTemplateId);
      stepsForProcess = processStepsMap[selectedTemplateId] || mockSteps;
    } else if (creationOption === 'copy' && selectedCopyId) {
      sourceProcess = processes.find(p => p.id === selectedCopyId);
      stepsForProcess = processStepsMap[selectedCopyId] || mockSteps;
    } else {
      // Для нового процесса не создаём шаги, а показываем формы создания
      stepsForProcess = [];
    }

    const newProcess: Process = {
      id,
      name: createName || 'Новый процесс',
      description: createDescription || '',
      type: (sourceProcess?.type || createType || 'approval') as 'approval' | 'review' | 'custom',
      status: 'draft',
      steps: stepsForProcess.length,
      projectsCount: createProject ? 1 : 0,
      documentsProcessed: 0,
      createdDate: new Date().toISOString().slice(0, 10),
      isTemplate: false,
      averageTime: 'Не определено'
    };

    setProcesses([newProcess, ...processes]);
    setProcessStepsMap({ ...processStepsMap, [id]: stepsForProcess });
    if (creationOption === 'new') {
      setProcessInitialCreateForms({ ...processInitialCreateForms, [id]: createStepsCount || 1 });
      const drafts: NewStepForm[] = Array.from({ length: createStepsCount || 1 }).map((_, i) => ({
        tempId: `draft-${i + 1}-${Date.now()}`,
        name: `Шаг ${i + 1}`,
        timeLimit: 3,
        isRequired: true,
        canFinishOnThis: (i + 1) === (createStepsCount || 1),
        canSkip: false,
        autoReject: false
      }));
      setDraftStepsMap({ ...draftStepsMap, [id]: drafts });
    }
    setIsCreateDialogOpen(false);
  };

  const addDraftStep = (processId: string) => {
    const list = draftStepsMap[processId] || [];
    const nextIndex = list.length + (processStepsMap[processId]?.length || 0) + 1;
    const newDraft: NewStepForm = {
      tempId: `draft-add-${Date.now()}`,
      name: `Шаг ${nextIndex}`,
      timeLimit: 3,
      isRequired: true,
      canFinishOnThis: false,
      canSkip: false,
      autoReject: false,
      participants: [],
      requireAllParticipants: false
    };
    setDraftStepsMap({ ...draftStepsMap, [processId]: [...list, newDraft] });
  };

  const saveDraftStep = (processId: string, draftIndex: number) => {
    const drafts = draftStepsMap[processId] || [];
    const draft = drafts[draftIndex];
    if (!draft) return;
    const existing = processStepsMap[processId] || [];
    const newStep: ProcessStep = {
      id: `step-${Date.now()}`,
      name: draft.name,
      order: existing.length + 1,
      participants: draft.participants || [],
      timeLimit: draft.timeLimit,
      isRequired: draft.isRequired,
      canFinishOnThis: draft.canFinishOnThis,
      canSkip: draft.canSkip,
      autoReject: draft.autoReject,
      rules: [
        { id: `rule-all-${Date.now()}`, type: 'all_required', enabled: draft.requireAllParticipants, description: 'Требуется проверка всех участников шага' },
        { id: `rule-af-${Date.now()}`, type: 'can_finish', enabled: draft.canFinishOnThis, description: 'Возможность завершить согласование на текущем шаге' },
        { id: `rule-ar-${Date.now()}`, type: 'auto_reject', enabled: draft.autoReject, description: 'Отклонение при несогласовании' }
      ]
    };
    const updatedDrafts = drafts.filter((_, i) => i !== draftIndex);
    setDraftStepsMap({ ...draftStepsMap, [processId]: updatedDrafts });
    setProcessStepsMap({ ...processStepsMap, [processId]: [...existing, newStep] });
    if (updatedDrafts.length === 0) {
      const { [processId]: _, ...rest } = processInitialCreateForms;
      setProcessInitialCreateForms(rest);
    }
  };

  const deleteDraftStep = (processId: string, draftIndex: number) => {
    const drafts = draftStepsMap[processId] || [];
    const updated = drafts.filter((_, i) => i !== draftIndex);
    setDraftStepsMap({ ...draftStepsMap, [processId]: updated });
    if (updated.length === 0) {
      const { [processId]: _, ...rest } = processInitialCreateForms;
      setProcessInitialCreateForms(rest);
    }
  };

  const deleteSavedStep = (processId: string, stepIndex: number) => {
    const existing = processStepsMap[processId] || [];
    const updated = existing.filter((_, i) => i !== stepIndex).map((s, idx) => ({ ...s, order: idx + 1 }));
    setProcessStepsMap({ ...processStepsMap, [processId]: updated });
  };

  const updateDraftStep = (processId: string, draftIndex: number, partial: Partial<NewStepForm>) => {
    const drafts = draftStepsMap[processId] || [];
    const updated = drafts.map((d, i) => (i === draftIndex ? { ...d, ...partial } : d));
    setDraftStepsMap({ ...draftStepsMap, [processId]: updated });
  };

  const applyProcessChanges = () => {
    setSelectedProcess(null);
  };

  const startEditStep = (processId: string, stepIndex: number) => {
    const steps = processStepsMap[processId] || [];
    const step = steps[stepIndex];
    if (!step) return;
    const rules = step.rules || [];
    const getRule = (t: any) => rules.find(r => r.type === t)?.enabled ?? false;
    const draft = {
      name: step.name,
      timeLimit: step.timeLimit,
      isRequired: step.isRequired,
      canFinishOnThis: step.canFinishOnThis,
      canSkip: step.canSkip,
      autoReject: getRule('auto_reject'),
      requireAll: getRule('all_required')
    };
    setEditingSteps(prev => ({ ...prev, [processId]: { ...(prev[processId] || {}), [stepIndex]: draft } }));
  };

  const cancelEditStep = (processId: string, stepIndex: number) => {
    setEditingSteps(prev => {
      const proc = { ...(prev[processId] || {}) };
      delete proc[stepIndex];
      return { ...prev, [processId]: proc };
    });
  };

  const saveEditStep = (processId: string, stepIndex: number) => {
    const procDraft = editingSteps[processId] || {};
    const draft = procDraft[stepIndex];
    if (!draft) return;
    const steps = processStepsMap[processId] || [];
    const step = steps[stepIndex];
    if (!step) return;
    const newRules = [
      { id: `rule-all-${Date.now()}`, type: 'all_required', enabled: draft.requireAll, description: 'Требуется проверка всех участников шага' },
      { id: `rule-af-${Date.now()}`, type: 'can_finish', enabled: draft.canFinishOnThis, description: 'Возможность завершить согласование на текущем шаге' },
      { id: `rule-ar-${Date.now()}`, type: 'auto_reject', enabled: draft.autoReject, description: 'Отклонение при несогласовании' }
    ];
    const updatedStep = { ...step, name: draft.name, timeLimit: draft.timeLimit, isRequired: draft.isRequired, canFinishOnThis: draft.canFinishOnThis, canSkip: draft.canSkip, autoReject: draft.autoReject, rules: newRules } as ProcessStep;
    const updatedSteps = steps.map((s, i) => i === stepIndex ? updatedStep : s);
    setProcessStepsMap({ ...processStepsMap, [processId]: updatedSteps });
    cancelEditStep(processId, stepIndex);
  };

  const duplicateSavedStep = (processId: string, stepIndex: number) => {
    const steps = processStepsMap[processId] || [];
    const step = steps[stepIndex];
    if (!step) return;
    const newStep: ProcessStep = {
      ...step,
      id: `step-copy-${Date.now()}`,
      name: `${step.name} - копия`,
      order: steps.length + 1,
    };
    setProcessStepsMap({ ...processStepsMap, [processId]: [...steps, newStep] });
  };

  const openAssigneePicker = async (processId: string, draftIndex: number) => {
    setAssigneePickerContext({ processId, draftIndex });
    setAssigneePickerMode('company');
    setSelectedEmployeesIds([]);
    setAvailableEmployees([]);
    setAssigneePickerOpen(true);
    try {
      // агрегируем компании со всех объектов
      const projects = listProjects();
      setPickerProjects(projects);
      const allCompaniesArrays = await Promise.all(projects.map(p => getProjectCompanies(p.id)));
      const byInn: Record<string, any> = {};
      allCompaniesArrays.flat().forEach(c => {
        if (!byInn[c.inn]) byInn[c.inn] = { ...c };
      });
      setPickerCompanyMap(byInn);
      setPickerCompanies(Object.values(byInn).map((c: any) => ({ inn: c.inn, name: c.name })));
    } catch (e) {
      setPickerCompanies([]);
      setPickerProjects([]);
    }
  };

  const loadEmployeesFromCompany = async (projectId: string, companyInn?: string) => {
    const companies = await getProjectCompanies(projectId);
    const filtered = companyInn ? companies.filter(c => c.inn === companyInn) : companies;
    const emps = await getEmployeesForCompanies(filtered);
    setAvailableEmployees(emps.map(e => ({ id: e.id, name: e.name, company: e.companyName })));
  };

  const loadEmployeesFromProject = async (projectId: string) => {
    const emps = await getProjectEmployees(projectId);
    setAvailableEmployees(emps.map(e => ({ id: e.id, name: e.name, company: e.companyName })));
  };

  const loadEmployeesFromCompanyGlobal = async (companyInn?: string) => {
    const companies = companyInn && pickerCompanyMap[companyInn] ? [pickerCompanyMap[companyInn]] : Object.values(pickerCompanyMap);
    const emps = await getEmployeesForCompanies(companies as any);
    setAvailableEmployees(emps.map(e => ({ id: e.id, name: e.name, company: e.companyName })));
  };

  const handleDuplicateProcess = (process: Process) => {
    setProcessToDuplicate(process);
    setDuplicateName(`${process.name} - копия`);
    setIsDuplicateDialogOpen(true);
  };

  const confirmDuplicate = () => {
    if (!processToDuplicate) return;
    const newProcess: Process = {
      ...processToDuplicate,
      id: `${processToDuplicate.id}-copy-${Date.now()}`,
      name: duplicateName || `${processToDuplicate.name} - копия`,
      status: processToDuplicate.status,
      createdDate: new Date().toISOString().slice(0, 10),
      lastUsed: undefined
    };
    setProcesses([newProcess, ...processes]);
    const steps = processStepsMap[processToDuplicate.id] || mockSteps;
    setProcessStepsMap({ ...processStepsMap, [newProcess.id]: steps });
    setIsDuplicateDialogOpen(false);
    setProcessToDuplicate(null);
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
                      <Select value={createType} onValueChange={(v: 'approval' | 'review' | 'custom') => setCreateType(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent className="w-[--radix-select-trigger-width]">
                          <SelectItem value="approval">Согласование документов</SelectItem>
                          <SelectItem value="review">Рассмотрение и проверка</SelectItem>
                          <SelectItem value="custom">Специализированный</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="processSteps">Количество шагов *</Label>
                      <Input type="number" min="1" max="10" value={createStepsCount} onChange={(e) => setCreateStepsCount(Number(e.target.value))} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="processName">Название процесса *</Label>
                    <Input id="processName" placeholder="Например, 'Согласование проектной документации'" value={createName} onChange={(e) => setCreateName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="processDescription">Описание</Label>
                    <Textarea id="processDescription" placeholder="Краткое описание процесса..." rows={3} value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="processProject">Привязка к объекту</Label>
                    <Select value={createProject} onValueChange={setCreateProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите объект (необязательно)" />
                      </SelectTrigger>
                      <SelectContent className="w-[--radix-select-trigger-width]">
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
                    <Card onClick={() => setCreationOption('new')} className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${creationOption === 'new' ? 'border-blue-500' : 'border-transparent'}`}>
                      <CardContent className="p-4 text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <h4 className="font-medium mb-1">Создать с нуля</h4>
                        <p className="text-sm text-gray-600">Настроить все шаги вручную</p>
                      </CardContent>
                    </Card>
                    <Card onClick={() => setCreationOption('template')} className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${creationOption === 'template' ? 'border-blue-500' : 'border-transparent'}`}>
                      <CardContent className="p-4 text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                        <h4 className="font-medium mb-1">Использовать шаблон</h4>
                        <p className="text-sm text-gray-600">На основе готового шаблона</p>
                      </CardContent>
                    </Card>
                    <Card onClick={() => setCreationOption('copy')} className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${creationOption === 'copy' ? 'border-blue-500' : 'border-transparent'}`}>
                      <CardContent className="p-4 text-center">
                        <Copy className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <h4 className="font-medium mb-1">Копировать существующий</h4>
                        <p className="text-sm text-gray-600">Дублировать готовый процесс</p>
                      </CardContent>
                    </Card>
                  </div>
                  {creationOption === 'template' && (
                    <div>
                      <Label htmlFor="templateSelect">Выберите шаблон</Label>
                      <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Шаблон процесса" />
                        </SelectTrigger>
                        <SelectContent className="w-[--radix-select-trigger-width]">
                          {processes.filter(p => p.isTemplate).map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {creationOption === 'copy' && (
                    <div>
                      <Label htmlFor="copySelect">Выберите процесс для копирования</Label>
                      <Select value={selectedCopyId} onValueChange={setSelectedCopyId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Существующий процесс" />
                        </SelectTrigger>
                        <SelectContent className="w-[--radix-select-trigger-width]">
                          {processes.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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

        

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Список процессов</TabsTrigger>
            <TabsTrigger value="templates">Шаблоны</TabsTrigger>
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
                          <Button variant="outline" size="sm" onClick={() => handleDuplicateProcess(process)}>
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
            <div className="space-y-4">
              {filteredProcesses.filter(p => p.isTemplate).map((process) => {
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
                            <Badge variant="outline">
                              <FileText className="w-3 h-3 mr-1" />
                              Шаблон
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{process.description}</p>
                        </div>
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button variant="outline" size="sm" onClick={() => setSelectedProcess(process)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDuplicateProcess(process)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Дублировать
                          </Button>
                        </div>
                      </div>
              </CardContent>
            </Card>
                );
              })}
              {filteredProcesses.filter(p => p.isTemplate).length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Шаблоны не найдены</p>
                </div>
              )}
            </div>
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
                      <Button size="sm" onClick={() => addDraftStep(selectedProcess.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить шаг
                      </Button>
                    </div>
                    {/* Показать формы создания шага, если процесс создан "с нуля" или уже есть черновики шагов */}
                    {processInitialCreateForms[selectedProcess.id] || (draftStepsMap[selectedProcess.id] && draftStepsMap[selectedProcess.id].length > 0) ? (
                      <div className="space-y-4">
                        {Array.from({ length: (draftStepsMap[selectedProcess.id]?.length || processInitialCreateForms[selectedProcess.id]) }).map((_, idx) => (
                          <Card key={`new-step-form-${idx}`}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center">
                                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">{idx + 1}</span>
                                  Новый шаг
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary">Черновик шага</Badge>
                                  <Button variant="outline" size="sm" onClick={() => deleteDraftStep(selectedProcess.id, idx)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Удалить шаг
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-3">Параметры шага</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <Label>Название шага</Label>
                                      <Input placeholder={`Шаг ${idx + 1}`} value={(draftStepsMap[selectedProcess.id]?.[idx]?.name) || ''} onChange={(e) => updateDraftStep(selectedProcess.id, idx, { name: e.target.value })} />
                                    </div>
                                    <div>
                                      <Label>Время согласования (дней)</Label>
                                      <Input type="number" min="1" value={(draftStepsMap[selectedProcess.id]?.[idx]?.timeLimit) ?? 3} onChange={(e) => updateDraftStep(selectedProcess.id, idx, { timeLimit: Number(e.target.value) })} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox checked={(draftStepsMap[selectedProcess.id]?.[idx]?.isRequired) ?? true} onCheckedChange={(v) => updateDraftStep(selectedProcess.id, idx, { isRequired: Boolean(v) })} />
                                      <span className="text-sm">Обязательный шаг</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox checked={(draftStepsMap[selectedProcess.id]?.[idx]?.canSkip) ?? false} onCheckedChange={(v) => updateDraftStep(selectedProcess.id, idx, { canSkip: Boolean(v) })} />
                                      <span className="text-sm">Можно пропустить</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox checked={(draftStepsMap[selectedProcess.id]?.[idx]?.autoReject) ?? false} onCheckedChange={(v) => updateDraftStep(selectedProcess.id, idx, { autoReject: Boolean(v) })} />
                                      <span className="text-sm">Авто-отклонение при несогласовании</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox checked={(draftStepsMap[selectedProcess.id]?.[idx]?.requireAllParticipants) ?? false} onCheckedChange={(v) => updateDraftStep(selectedProcess.id, idx, { requireAllParticipants: Boolean(v) })} />
                                      <span className="text-sm">Требуется проверка всех участников шага</span>
                                    </div>
                                    <div className="pt-2">
                                      <Button size="sm" onClick={() => saveDraftStep(selectedProcess.id, idx)}>
                                        Сохранить шаг
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-3">Участники шага</h4>
                                  <div className="space-y-2">
                                    {(draftStepsMap[selectedProcess.id]?.[idx]?.participants?.length || 0) === 0 ? (
                                      <div className="p-2 bg-gray-50 rounded text-sm text-gray-500">Пока нет участников</div>
                                    ) : (
                                      (draftStepsMap[selectedProcess.id]?.[idx]?.participants || []).map((p) => (
                                        <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                          <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <div>
                                              <div className="text-sm font-medium">{p.name}</div>
                                              <div className="text-xs text-gray-500">{p.role}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Badge variant={p.isRequired ? 'default' : 'secondary'} className="text-xs">
                                              {p.isRequired ? 'Обязательный' : 'Опциональный'}
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                              const drafts = draftStepsMap[selectedProcess.id] || [];
                                              const draft = drafts[idx];
                                              const updated = (draft.participants || []).filter((pp) => pp.id !== p.id);
                                              const updatedDraft = { ...draft, participants: updated } as NewStepForm;
                                              const updatedDrafts = drafts.map((d, i) => i === idx ? updatedDraft : d);
                                              setDraftStepsMap({ ...draftStepsMap, [selectedProcess.id]: updatedDrafts });
                                            }}>
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                    <div className="grid grid-cols-1 gap-2">
                                      <Button variant="outline" size="sm" onClick={() => openAssigneePicker(selectedProcess.id, idx)}>
                                        <User className="w-4 h-4 mr-2" />
                                        Добавить пользователя
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <div className="flex justify-end">
                          <Button onClick={applyProcessChanges}>Применить изменения</Button>
                        </div>
                      </div>
                    ) : (
                    
                    /* Иначе показываем существующие шаги */
                    (processStepsMap[selectedProcess.id] || mockSteps).map((step, index) => (
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
                                    <div className="flex items-center space-x-2">
                                    <Badge variant={participant.isRequired ? 'default' : 'secondary'} className="text-xs">
                                      {participant.isRequired ? 'Обязательный' : 'Опциональный'}
                                    </Badge>
                                      <Button variant="ghost" size="sm" onClick={() => {
                                        const steps = processStepsMap[selectedProcess.id] || [];
                                        const updated = steps.map((s, i) => i === index ? { ...s, participants: s.participants.filter(p => p.id !== participant.id) } : s);
                                        setProcessStepsMap({ ...processStepsMap, [selectedProcess.id]: updated });
                                      }}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" className="w-full" onClick={() => openAssigneePicker(selectedProcess.id, -1)}>
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
                                {(function(){
                                  const isEditing = Boolean(editingSteps[selectedProcess.id]?.[index]);
                                  const draft = editingSteps[selectedProcess.id]?.[index];
                                  const requiredChecked = isEditing ? (draft?.isRequired ?? step.isRequired) : step.isRequired;
                                  const canSkipChecked = isEditing ? (draft?.canSkip ?? step.canSkip) : step.canSkip;
                                  return (
                                    <>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox checked={requiredChecked} disabled={!isEditing} onCheckedChange={(v)=>{
                                          if(!isEditing) return;
                                          const procDraft = editingSteps[selectedProcess.id] || {};
                                          const d = procDraft[index] || {} as any;
                                          const updated = { ...d, isRequired: Boolean(v) };
                                          setEditingSteps({ ...editingSteps, [selectedProcess.id]: { ...procDraft, [index]: updated } });
                                        }} />
                                        <span className="text-sm">Обязательный шаг</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox checked={canSkipChecked} disabled={!isEditing} onCheckedChange={(v)=>{
                                          if(!isEditing) return;
                                          const procDraft = editingSteps[selectedProcess.id] || {};
                                          const d = procDraft[index] || {} as any;
                                          const updated = { ...d, canSkip: Boolean(v) };
                                          setEditingSteps({ ...editingSteps, [selectedProcess.id]: { ...procDraft, [index]: updated } });
                                        }} />
                                        <span className="text-sm">Можно пропустить</span>
                                      </div>
                                    </>
                                  );
                                })()}
                                {step.rules.map((rule) => {
                                  const isEditing = Boolean(editingSteps[selectedProcess.id]?.[index]);
                                  const draft = editingSteps[selectedProcess.id]?.[index];
                                  const currentChecked = isEditing
                                    ? (rule.type === 'all_required'
                                      ? draft.requireAll
                                      : rule.type === 'can_finish'
                                        ? draft.canFinishOnThis
                                        : rule.type === 'auto_reject'
                                          ? draft.autoReject
                                          : rule.enabled)
                                    : rule.enabled;
                                  return (
                                  <div key={rule.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={currentChecked}
                                        disabled={!isEditing}
                                        onCheckedChange={(v) => {
                                          if (!isEditing) return;
                                          const procDraft = editingSteps[selectedProcess.id] || {};
                                          const d = procDraft[index];
                                          if (!d) return;
                                          const updated = { ...d } as any;
                                          if (rule.type === 'all_required') updated.requireAll = Boolean(v);
                                          if (rule.type === 'can_finish') updated.canFinishOnThis = Boolean(v);
                                          if (rule.type === 'auto_reject') updated.autoReject = Boolean(v);
                                          setEditingSteps({ ...editingSteps, [selectedProcess.id]: { ...procDraft, [index]: updated } });
                                        }}
                                      />
                                      <span className="text-sm">{rule.type === 'can_finish' ? 'Возможность проставить статус согласования' : rule.description}</span>
                                  </div>
                                  );
                                })}
                                
                                <div className="pt-2 border-t border-gray-200">
                                  <div className="grid grid-cols-3 gap-2">
                                    {editingSteps[selectedProcess.id]?.[index] ? (
                                      <>
                                        <Button variant="outline" size="sm" onClick={() => saveEditStep(selectedProcess.id, index)}>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Сохранить
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => cancelEditStep(selectedProcess.id, index)}>
                                          Отмена
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => duplicateSavedStep(selectedProcess.id, index)}>
                                          <Copy className="w-4 h-4 mr-2" />
                                          Дублировать
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button variant="outline" size="sm" onClick={() => startEditStep(selectedProcess.id, index)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Редактировать
                                    </Button>
                                        <Button variant="outline" size="sm" onClick={() => duplicateSavedStep(selectedProcess.id, index)}>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Дублировать
                                    </Button>
                                        <Button variant="outline" size="sm" onClick={() => deleteSavedStep(selectedProcess.id, index)}>
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Удалить шаг
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                    )}
                    <div className="flex justify-end mt-4">
                      <Button onClick={applyProcessChanges}>Применить изменения</Button>
                    </div>
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
                          <SelectContent className="w-[--radix-select-trigger-width]">
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

        {/* Duplicate Process Dialog */}
        <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Copy className="w-5 h-5" />
                <span>Дублирование процесса</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="duplicateName">Новое имя процесса</Label>
                <Input id="duplicateName" value={duplicateName} onChange={(e) => setDuplicateName(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>Отмена</Button>
                <Button onClick={confirmDuplicate}>Дублировать</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assignee Picker Dialog */}
        <Dialog open={assigneePickerOpen} onOpenChange={setAssigneePickerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Добавить пользователя</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button variant={assigneePickerMode === 'company' ? 'default' : 'outline'} size="sm" onClick={() => setAssigneePickerMode('company')}>Из компании</Button>
                <Button variant={assigneePickerMode === 'project' ? 'default' : 'outline'} size="sm" onClick={() => setAssigneePickerMode('project')}>Из объекта</Button>
              </div>

              {assigneePickerMode === 'company' && (
                <div className="space-y-2">
                  <Label>Компания</Label>
                  <Select onValueChange={(inn) => loadEmployeesFromCompanyGlobal(inn)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите компанию" />
                    </SelectTrigger>
                    <SelectContent className="w-[--radix-select-trigger-width]">
                      {pickerCompanies.map(c => (
                        <SelectItem key={c.inn} value={c.inn}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => loadEmployeesFromCompanyGlobal()}>Показать всех сотрудников всех компаний</Button>
                </div>
              )}

              {assigneePickerMode === 'project' && selectedProcess && (
                <div className="space-y-2">
                  <Label>Объект</Label>
                  <Select onValueChange={(pid) => loadEmployeesFromProject(pid)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите объект" />
                    </SelectTrigger>
                    <SelectContent className="w-[--radix-select-trigger-width]">
                      {pickerProjects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="border rounded p-3 max-h-64 overflow-y-auto">
                {availableEmployees.length === 0 ? (
                  <div className="text-sm text-gray-500">Нет данных. Выберите источник выше.</div>
                ) : (
                  <div className="space-y-2">
                    {availableEmployees.map((e) => (
                      <label key={e.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">{e.name}</div>
                          <div className="text-xs text-gray-500">{e.company}</div>
                        </div>
                        <Checkbox checked={selectedEmployeesIds.includes(e.id)} onCheckedChange={(v) => {
                          const checked = Boolean(v);
                          setSelectedEmployeesIds((prev) => checked ? [...prev, e.id] : prev.filter(id => id !== e.id));
                        }} />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAssigneePickerOpen(false)}>Отмена</Button>
                <Button onClick={() => {
                  if (!assigneePickerContext) { setAssigneePickerOpen(false); return; }
                  const { processId, draftIndex } = assigneePickerContext;
                  // формируем участников из выбранных сотрудников
                  const newParticipants: Participant[] = selectedEmployeesIds.map((id, idx) => {
                    const emp = availableEmployees.find(e => e.id === id)!;
                    return {
                      id: emp.id,
                      name: emp.name,
                      role: 'Участник',
                      type: 'user',
                      isRequired: false
                    };
                  });
                  if (draftIndex >= 0) {
                    const drafts = draftStepsMap[processId] || [];
                    const draft = drafts[draftIndex];
                    const alreadyHas = draft?.participants?.length || 0;
                    const participants = [...(draft?.participants || [])];
                    newParticipants.forEach((p, idx) => {
                      participants.push({ ...p, isRequired: alreadyHas === 0 && idx === 0 });
                    });
                    const updatedDraft: NewStepForm = { ...draft, participants } as NewStepForm;
                    const updatedDrafts = drafts.map((d, i) => i === draftIndex ? updatedDraft : d);
                    setDraftStepsMap({ ...draftStepsMap, [processId]: updatedDrafts });
                  } else {
                    // добавление в существующий сохранённый шаг: используем первый шаг как пример (для демо)
                    const steps = processStepsMap[processId] || [];
                    if (steps.length > 0) {
                      const first = steps[0];
                      const alreadyHas = first.participants.length;
                      const updatedFirst: ProcessStep = {
                        ...first,
                        participants: [
                          ...first.participants,
                          ...newParticipants.map((p, idx) => ({ ...p, isRequired: alreadyHas === 0 && idx === 0 }))
                        ]
                      };
                      const updatedSteps = steps.map((s, i) => i === 0 ? updatedFirst : s);
                      setProcessStepsMap({ ...processStepsMap, [processId]: updatedSteps });
                    }
                  }
                  setAssigneePickerOpen(false);
                }}>Добавить</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
