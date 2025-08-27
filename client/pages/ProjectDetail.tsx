import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProjectMeta, listAccessibleProcessesForCompany } from '../../shared/api';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  FolderOpen,
  Eye,
  Download
} from 'lucide-react';

const mockProject = {
  id: '1',
  name: 'ЖК «Северный парк»',
  description: 'Жилой комплекс премиум-класса, 25 этажей',
  status: 'on-approval',
  progress: 75,
  location: 'г. Москва, Северный округ',
  deadline: '15.02.2024'
};

const mockFolderStructure = [
  { name: '01 - Общая информация', documentCount: 5 },
  { name: '02 - Объекты строительства', documentCount: 12, expanded: true, children: [
    { name: 'Очередь 1', documentCount: 8, children: [
      { name: '01 - Делопроизводство', documentCount: 3 },
      { name: '02 - ИРД', documentCount: 7 },
      { name: '03 - Концепция', documentCount: 4 },
      { name: '04 - ЧТУ, ТУ и Стандарты', documentCount: 9 },
      { name: '05 - Регламенты', documentCount: 2 },
      { name: '06 - Согласования', documentCount: 15 },
      { name: '07 - ПД (Проектная документация)', documentCount: 45, active: true },
      { name: '08 - Экспертиза', documentCount: 8 }
    ]}
  ]},
  { name: '03 - Инженерные системы', documentCount: 28 }
];

const mockDocuments = [
  {
    id: '1',
    name: 'Архитектурные решения - Планы этажей',
    type: 'PDF',
    size: '2.4 МБ',
    status: 'on-approval',
    version: '1.2',
    author: 'Петр Иванов',
    uploadDate: '2024-01-15',
    comments: 3
  },
  {
    id: '2', 
    name: 'Конструктивные решения - Фундамент',
    type: 'DWG',
    size: '5.1 МБ',
    status: 'approved',
    version: '2.0',
    author: 'Анна Сидорова',
    uploadDate: '2024-01-12',
    comments: 1
  },
  {
    id: '3',
    name: 'Система отопления - Схемы',
    type: 'PDF',
    size: '1.8 МБ',
    status: 'draft',
    version: '1.0',
    author: 'Михаил Козлов',
    uploadDate: '2024-01-18',
    comments: 0
  }
];

const statusConfig = {
  'draft': { label: 'Черновик', color: 'bg-gray-500', icon: Eye },
  'on-approval': { label: 'На согласовании', color: 'bg-yellow-500', icon: Clock },
  'approved': { label: 'Согласован', color: 'bg-green-500', icon: CheckCircle },
  'rejected': { label: 'Отклонен', color: 'bg-red-500', icon: Clock }
};

function parseDeadline(input: string): Date | undefined {
  if (!input || input === '—') return undefined;
  const parts = input.split('.');
  if (parts.length !== 3) return undefined;
  const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
  if (!yyyy || !mm || !dd) return undefined;
  return new Date(yyyy, mm - 1, dd);
}

function getInlineStatusLabelAndColor(status: string, deadline: string, progress: number): { label: string; colorClass: string } {
  if (status === 'approved') {
    return { label: 'Завершен', colorClass: 'text-green-600' };
  }
  const deadlineDate = parseDeadline(deadline);
  const now = new Date();
  const isOverdue = Boolean(deadlineDate && deadlineDate < now && progress < 100);
  if (isOverdue) {
    return { label: 'В работе — просрочен', colorClass: 'text-amber-600' };
  }
  return { label: 'В работе', colorClass: 'text-blue-600' };
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedFolder, setSelectedFolder] = useState('07 - ПД (Проектная документация)');
  const [activeTab, setActiveTab] = useState('documents');
  const [projectName, setProjectName] = useState<string>('Объект');
  const [folderDocuments, setFolderDocuments] = useState<any[]>(mockDocuments);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const [isStartApprovalOpen, setIsStartApprovalOpen] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | undefined>(undefined);
  const [availableProcesses, setAvailableProcesses] = useState<Array<{ id: string; name: string; steps: number }>>([]);
  const projectInlineStatus = getInlineStatusLabelAndColor(mockProject.status, mockProject.deadline, mockProject.progress);

  // Автоматически выбираем папку из URL параметров при загрузке
  useEffect(() => {
    const folderFromUrl = searchParams.get('folder');
    if (folderFromUrl) {
      const decodedFolderName = decodeURIComponent(folderFromUrl);
      setSelectedFolder(decodedFolderName);
      // Автоматически переключаемся на вкладку "Документы" если пришли из списка папок
      setActiveTab('documents');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;
    const meta = getProjectMeta(id);
    if (meta?.name) setProjectName(meta.name);
  }, [id]);

  useEffect(() => {
    listAccessibleProcessesForCompany(undefined).then(list => {
      setAvailableProcesses(list.filter(p => p.status === 'active' && !p.isTemplate));
    });
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        {searchParams.get('folder') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-700 mb-1">
                  <Link to="/documents" className="hover:text-blue-600 font-medium">
                    Документы
                  </Link>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">{projectName}</span>
                  <span>/</span>
                  <span className="text-blue-600 font-medium">{selectedFolder}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Вы перешли к папке "{selectedFolder}" из списка документов
                </p>
              </div>
              <Link to="/documents">
                <Button variant="outline" size="sm">
                  ← Назад к документам
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Project Header */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{projectName}
                  <span className={`ml-3 text-base font-normal ${projectInlineStatus.colorClass}`}>{projectInlineStatus.label}</span>
                </h1>
              </div>
              <p className="text-gray-600 mb-4">{mockProject.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Прогресс выполнения</span>
                  <span className="font-medium">{mockProject.progress}%</span>
                </div>
                <Progress value={mockProject.progress} className="h-2" />
              </div>
            </div>
            <div className="flex space-x-2 ml-6">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                <Link to={`/projects/${id}/team`}>Команда</Link>
              </Button>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                <Link to={`/projects/${id}/organizations`}>Организации</Link>
              </Button>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Загрузить докумен��ы
              </Button>
            </div>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left panel - Folder structure */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Структура проекта</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {mockFolderStructure.map((folder, index) => (
                    <div key={index}>
                      <div 
                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                          folder.name === selectedFolder ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedFolder(folder.name)}
                      >
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium truncate">{folder.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {folder.documentCount}
                        </span>
                      </div>
                      {folder.children && folder.expanded && (
                        <div className="ml-4">
                          {folder.children.map((subfolder, subIndex) => (
                            <div key={subIndex}>
                              <div
                                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                                  subfolder.name === selectedFolder ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                }`}
                                onClick={() => setSelectedFolder(subfolder.name)}
                              >
                                <div className="flex items-center space-x-2">
                                  <FolderOpen className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm truncate">{subfolder.name}</span>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {subfolder.documentCount}
                                </span>
                              </div>
                              {subfolder.children && (
                                <div className="ml-4">
                                  {subfolder.children.map((subsubfolder, subsubIndex) => (
                                    <div
                                      key={subsubIndex}
                                      className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                                        subsubfolder.name === selectedFolder ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                      }`}
                                      onClick={() => setSelectedFolder(subsubfolder.name)}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <FolderOpen className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm truncate">{subsubfolder.name}</span>
                                      </div>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {subsubfolder.documentCount}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right panel - Content */}
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedFolder}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Загрузить
                    </Button>
                    <Dialog open={isStartApprovalOpen} onOpenChange={setIsStartApprovalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Согласовать выбранные
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Запуск процесса согласования</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <span className="block text-sm text-gray-600 mb-1">Процесс согласования</span>
                            <Select value={selectedProcessId} onValueChange={setSelectedProcessId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите процесс" />
                              </SelectTrigger>
                              <SelectContent className="w-[--radix-select-trigger-width]">
                                {availableProcesses.map(p => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsStartApprovalOpen(false)}>Отмена</Button>
                            <Button onClick={() => {
                              if (!selectedProcessId) return;
                              const proc = availableProcesses.find(p => p.id === selectedProcessId);
                              if (!proc) return;
                              setFolderDocuments(prev => prev.map(d => selectedDocs[d.id] ? ({ ...d, status: 'on-approval', processInfo: { processId: proc.id, processName: proc.name, currentStep: 1, totalSteps: proc.steps } }) : d));
                              setIsStartApprovalOpen(false);
                              setSelectedDocs({});
                              setSelectedProcessId(undefined);
                            }} disabled={!selectedProcessId}>Запустить</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="documents">Документы</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents" className="mt-6">
                    <div className="space-y-4">
                      {folderDocuments.map((doc) => {
                        const statusInfo = statusConfig[doc.status];
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <Checkbox checked={!!selectedDocs[doc.id]} onCheckedChange={(v) => setSelectedDocs(prev => ({ ...prev, [doc.id]: Boolean(v) }))} />
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="font-medium">{doc.name}</div>
                                <div className="text-sm text-gray-500">
                                  {doc.type} • {doc.size} • v{doc.version} • {doc.author}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge className={`${statusInfo.color} text-white`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                              {doc.status === 'on-approval' && (doc as any).processInfo && (
                                <Badge variant="secondary">На согласовании по процессу — {(doc as any).processInfo.processName}. Текущий шаг: {(doc as any).processInfo.currentStep}</Badge>
                              )}
                              {doc.comments > 0 && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  {doc.comments}
                                </div>
                              )}
                              <Link to={`/documents/${doc.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
