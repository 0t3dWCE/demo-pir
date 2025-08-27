import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useRole } from '../contexts/RoleContext';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { listAccessibleProcessesForCompany } from '../../shared/api';
import { 
  Search, 
  Plus, 
  FileText, 
  FolderOpen,
  Upload,
  Download,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  Building2,
  Filter,
  Grid,
  List,
  ArrowUpDown
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  version: string;
  status: 'draft' | 'in-review' | 'on-approval' | 'approved' | 'rejected' | 'in-id';
  author: string;
  project: string;
  folder: string;
  uploadDate: string;
  lastModified: string;
  comments: number;
  description?: string;
  tags: string[];
  processInfo?: { processId: string; processName: string; currentStep: number; totalSteps: number };
}

interface Folder {
  id: string;
  name: string;
  project: string;
  documentCount: number;
  lastActivity: string;
  icon: string;
}

const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    name: '07 - ПД (Проектная документация)',
    project: 'ЖК «Северный парк»',
    documentCount: 45,
    lastActivity: '2024-01-22',
    icon: '📁'
  },
  {
    id: 'folder-2',
    name: '02 - ИРД',
    project: 'ЖК «Северный парк»',
    documentCount: 12,
    lastActivity: '2024-01-20',
    icon: '📋'
  },
  {
    id: 'folder-3',
    name: '07 - ПД (Проектная документация)',
    project: 'БЦ «Технологический»',
    documentCount: 28,
    lastActivity: '2024-01-21',
    icon: '📁'
  },
  {
    id: 'folder-4',
    name: '08 - Экспертиза',
    project: 'ТРК «Галерея»',
    documentCount: 15,
    lastActivity: '2024-01-19',
    icon: '🔍'
  }
];

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Архитектурные решения - Планы этажей',
    type: 'PDF',
    size: '2.4 МБ',
    version: '1.2',
    status: 'approved',
    author: 'Петр Иванов',
    project: 'ЖК «Северный парк»',
    folder: '07 - ПД (Проектная документация)',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-20',
    comments: 3,
    description: 'Архитектурные планы этажей жилого комплекса',
    tags: ['архитектура', 'планы', 'этажи']
  },
  {
    id: 'doc-2',
    name: 'Конструктивные решения - Фундамент',
    type: 'DWG',
    size: '5.1 МБ',
    version: '2.0',
    status: 'on-approval',
    author: 'Анна Сидорова',
    project: 'БЦ «Технологический»',
    folder: '07 - ПД (Проектная документация)',
    uploadDate: '2024-01-12',
    lastModified: '2024-01-18',
    comments: 5,
    description: 'Конструктивные решения фундамента офисного центра',
    tags: ['конструкции', 'фундамент']
  },
  {
    id: 'doc-3',
    name: 'Система отопления - Схемы',
    type: 'PDF',
    size: '1.8 МБ',
    version: '1.0',
    status: 'draft',
    author: 'Михаил Козлов',
    project: 'ЖК «Северный парк»',
    folder: '07 - ПД (Проектная документация)',
    uploadDate: '2024-01-18',
    lastModified: '2024-01-18',
    comments: 0,
    description: 'Схемы системы отопления жилого комплекса',
    tags: ['инженерные сети', 'отопление']
  },
  {
    id: 'doc-4',
    name: 'Исходно-разрешительная документация',
    type: 'PDF',
    size: '3.2 МБ',
    version: '1.1',
    status: 'approved',
    author: 'Елена Волкова',
    project: 'ТРК «Галерея»',
    folder: '02 - ИРД',
    uploadDate: '2024-01-10',
    lastModified: '2024-01-15',
    comments: 2,
    description: 'Комплект исходно-разрешительной документации',
    tags: ['ИРД', 'разрешения']
  },
  {
    id: 'doc-5',
    name: 'Заключение экспертизы',
    type: 'PDF',
    size: '0.8 МБ',
    version: '1.0',
    status: 'in-id',
    author: 'Дмитрий Петров',
    project: 'ТРК «Галерея»',
    folder: '08 - Экспертиза',
    uploadDate: '2024-01-08',
    lastModified: '2024-01-19',
    comments: 1,
    description: 'Положительное заключение государственной экспертизы',
    tags: ['экспертиза', 'заключение']
  },
  {
    id: 'doc-6',
    name: 'Электроснабжение - Схемы питания',
    type: 'DWG',
    size: '4.2 МБ',
    version: '1.3',
    status: 'rejected',
    author: 'Ольга Смирнова',
    project: 'БЦ «Технологический»',
    folder: '07 - ПД (Проектная документация)',
    uploadDate: '2024-01-14',
    lastModified: '2024-01-21',
    comments: 8,
    description: 'Схемы электроснабжения офисного центра',
    tags: ['электроснабжение', 'схемы']
  }
];

const statusConfig = {
  'draft': { label: 'Черновик', color: 'bg-gray-500', icon: Eye },
  'in-review': { label: 'На проверке', color: 'bg-blue-500', icon: Clock },
  'on-approval': { label: 'На согласовании', color: 'bg-yellow-500', icon: Clock },
  'approved': { label: 'Согласован', color: 'bg-green-500', icon: CheckCircle },
  'rejected': { label: 'Отклонен', color: 'bg-red-500', icon: XCircle },
  'in-id': { label: 'В ИД', color: 'bg-purple-500', icon: CheckCircle }
};

export default function Documents() {
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'folders' | 'documents'>('folders');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('lastModified');
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const [isStartApprovalOpen, setIsStartApprovalOpen] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | undefined>(undefined);

  const [availableProcesses, setAvailableProcesses] = useState<Array<{ id: string; name: string; steps: number }>>([]);
  useEffect(() => {
    listAccessibleProcessesForCompany(currentUser.company).then(list => {
      setAvailableProcesses(list.filter(p => p.status === 'active' && !p.isTemplate));
    });
  }, [currentUser.company]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesProject = projectFilter === 'all' || doc.project.includes(projectFilter);
    const matchesFolder = folderFilter === 'all' || doc.folder === folderFilter;
    return matchesSearch && matchesStatus && matchesProject && matchesFolder;
  });

  const filteredFolders = mockFolders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         folder.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === 'all' || folder.project.includes(projectFilter);
    return matchesSearch && matchesProject;
  });

  const canUpload = ['designer', 'project-manager', 'company-admin', 'root-admin'].includes(currentUser.role);
  const canApprove = ['customer', 'reviewer', 'company-admin', 'root-admin'].includes(currentUser.role);

  const handleUploadDocument = () => {
    console.log('Uploading document');
    setIsUploadDialogOpen(false);
  };

  const stats = {
    total: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    onApproval: documents.filter(d => d.status === 'on-approval').length,
    approved: documents.filter(d => d.status === 'approved').length,
    folders: mockFolders.length
  };

  const toggleSelectDoc = (id: string, checked: boolean) => {
    setSelectedDocs(prev => ({ ...prev, [id]: checked }));
  };

  const startApproval = () => {
    if (!selectedProcessId) return;
    const proc = availableProcesses.find(p => p.id === selectedProcessId);
    if (!proc) return;
    setDocuments(prev => prev.map(d => selectedDocs[d.id] ? {
      ...d,
      status: 'on-approval',
      processInfo: { processId: proc.id, processName: proc.name, currentStep: 1, totalSteps: proc.steps }
    } : d));
    setIsStartApprovalOpen(false);
    setSelectedProcessId(undefined);
    setSelectedDocs({});
  };

  // Автопрогресс шагов (демо)
  useEffect(() => {
    const timer = setInterval(() => {
      setDocuments(prev => prev.map(d => (
        d.status === 'on-approval' && d.processInfo && d.processInfo.currentStep < d.processInfo.totalSteps
          ? { ...d, processInfo: { ...d.processInfo, currentStep: d.processInfo.currentStep + 1 } }
          : d
      )));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Документы</h1>
            <p className="text-gray-600 mt-1">
              Управление проектной документацией
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'folders' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('folders')}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Папки
              </Button>
              <Button
                variant={viewMode === 'documents' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('documents')}
              >
                <List className="w-4 h-4 mr-2" />
                Список
              </Button>
            </div>
            {canUpload && (
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Загрузить документ</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Загрузка документа</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file">Выберите файл</Label>
                      <Input id="file" type="file" accept=".pdf,.dwg,.doc,.docx,.xls,.xlsx" />
                    </div>
                    <div>
                      <Label htmlFor="project">Проект</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите проект" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project-1">ЖК «Северный парк»</SelectItem>
                          <SelectItem value="project-2">БЦ «Технологический»</SelectItem>
                          <SelectItem value="project-3">ТРК «Галерея»</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="folder">Папка</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите папку" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="folder-1">07 - ПД (Проектная документация)</SelectItem>
                          <SelectItem value="folder-2">02 - ИРД</SelectItem>
                          <SelectItem value="folder-3">08 - Экспертиза</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleUploadDocument}>
                        Загрузить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего документов</div>
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
              <div className="text-2xl font-bold text-yellow-600">{stats.onApproval}</div>
              <div className="text-sm text-gray-600">На согласовании</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Согласованных</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{stats.folders}</div>
              <div className="text-sm text-gray-600">Папок</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск документов..."
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
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="on-approval">На согласовании</SelectItem>
                  <SelectItem value="approved">Согласованные</SelectItem>
                  <SelectItem value="rejected">Отклоненные</SelectItem>
                  <SelectItem value="in-id">В ИД</SelectItem>
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

              {viewMode === 'documents' && (
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastModified">По дате изменения</SelectItem>
                    <SelectItem value="name">По названию</SelectItem>
                    <SelectItem value="author">По автору</SelectItem>
                    <SelectItem value="status">По статусу</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === 'folders' ? (
          /* Folders View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFolders.map((folder) => {
              // Определяем ID проекта на основе названия для создания ссылки
              const projectId = folder.project.includes('Северный') ? '1' :
                               folder.project.includes('Технологический') ? '2' :
                               folder.project.includes('Галерея') ? '3' : '1';

              // Кодируем название папки для URL
              const encodedFolderName = encodeURIComponent(folder.name);

              return (
                <Link key={folder.id} to={`/projects/${projectId}?folder=${encodedFolderName}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{folder.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{folder.name}</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2" />
                              {folder.project}
                            </div>
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              {folder.documentCount} документов
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Активность: {folder.lastActivity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Documents List View */
          <div className="space-y-4">
            {filteredDocuments.map((doc) => {
              const statusInfo = statusConfig[doc.status];
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold">{doc.name}</h3>
                          <Badge className={`${statusInfo.color} text-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="outline">{doc.type}</Badge>
                          {doc.status === 'on-approval' && doc.processInfo && (
                            <Badge variant="secondary">На согласовании по процессу — {doc.processInfo.processName}. Текущий шаг: {doc.processInfo.currentStep}</Badge>
                          )}
                        </div>

                        {doc.description && (
                          <p className="text-gray-600 mb-3">{doc.description}</p>
                        )}

                        <div className="grid grid-cols-3 gap-6 mb-4">
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Основная информация</div>
                            <div className="space-y-1 text-sm">
                              <div>Размер: {doc.size}</div>
                              <div>Версия: {doc.version}</div>
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-2" />
                                {doc.author}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Проект и расположение</div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center">
                                <Building2 className="w-3 h-3 mr-2" />
                                {doc.project}
                              </div>
                              <div className="flex items-center">
                                <FolderOpen className="w-3 h-3 mr-2" />
                                {doc.folder}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Даты и активность</div>
                            <div className="space-y-1 text-sm">
                              <div>Загружен: {doc.uploadDate}</div>
                              <div>Изменен: {doc.lastModified}</div>
                              {doc.comments > 0 && (
                                <div className="flex items-center">
                                  <MessageSquare className="w-3 h-3 mr-2" />
                                  {doc.comments} комментариев
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {doc.tags.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">Теги:</div>
                            <div className="flex flex-wrap gap-2">
                              {doc.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox checked={!!selectedDocs[doc.id]} onCheckedChange={(v) => toggleSelectDoc(doc.id, Boolean(v))} />
                          <Link to={`/documents/${doc.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Просмотр
                          </Button>
                          </Link>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </Button>
                        {canApprove && doc.status === 'on-approval' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Согласовать
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {Object.values(selectedDocs).some(Boolean) && (
              <div className="sticky bottom-4 flex justify-end">
                <Dialog open={isStartApprovalOpen} onOpenChange={setIsStartApprovalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Согласовать выбранные
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Запуск процесса согласования</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Процесс согласования</Label>
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
                        <Button onClick={startApproval} disabled={!selectedProcessId}>Запустить</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}

        {/* Empty States */}
        {viewMode === 'folders' && filteredFolders.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Папки не найдены</p>
          </div>
        )}

        {viewMode === 'documents' && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Доку��енты не найдены</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
