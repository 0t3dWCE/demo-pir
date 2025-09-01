import { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  RefreshCw, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Download,
  Upload,
  Activity,
  Server,
  Database,
  Wifi,
  WifiOff,
  AlertTriangle,
  Eye,
  RotateCcw,
  Link,
  Calendar,
  User,
  Building2,
  Send
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  projectName: string;
  authorName: string;
  agreedDate: string;
  status: 'ready' | 'queued' | 'sending' | 'sent_awaiting' | 'accepted' | 'displayed' | 'error' | 'delayed' | 'retry_scheduled';
  exportId?: string;
  errorMessage?: string;
  retryCount: number;
  lastAttempt: string;
  nextRetry?: string;
  idUrl?: string;
}

interface IntegrationStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastCheck: string;
  responseTime: number;
  uptime: number;
  errorRate: number;
}

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Архитектурные решения - Планы этажей',
    projectName: 'ЖК «Северный парк»',
    authorName: 'Петр Иванов',
    agreedDate: '2024-01-20 14:30',
    status: 'displayed',
    exportId: 'EXP-001-2024',
    retryCount: 0,
    lastAttempt: '2024-01-20 14:35',
    idUrl: 'https://id.example.com/docs/EXP-001-2024'
  },
  {
    id: 'doc-2',
    name: 'Конструктивные решения - Фундамент',
    projectName: 'БЦ «Технологический»',
    authorName: 'Анна Сидорова',
    agreedDate: '2024-01-21 10:15',
    status: 'error',
    errorMessage: 'Объект не найден в системе ИД',
    retryCount: 3,
    lastAttempt: '2024-01-21 16:45',
    nextRetry: '2024-01-22 10:00'
  },
  {
    id: 'doc-3',
    name: 'Система отопления - Схемы',
    projectName: 'ЖК «Северный парк»',
    authorName: 'Михаил Козлов',
    agreedDate: '2024-01-21 16:20',
    status: 'delayed',
    errorMessage: 'Подрядчик не назначен в ИД',
    retryCount: 1,
    lastAttempt: '2024-01-21 16:25',
    nextRetry: '2024-01-22 09:00'
  },
  {
    id: 'doc-4',
    name: 'Электроснабжение - Схемы',
    projectName: 'БЦ «Технологический»',
    authorName: 'Елена Волкова',
    agreedDate: '2024-01-22 09:45',
    status: 'sending',
    retryCount: 0,
    lastAttempt: '2024-01-22 09:50'
  },
  {
    id: 'doc-5',
    name: 'Водоснабжение и канализация',
    projectName: 'ТРК «Галерея»',
    authorName: 'Дмитрий Петров',
    agreedDate: '2024-01-22 11:30',
    status: 'sent_awaiting',
    exportId: 'EXP-005-2024',
    retryCount: 0,
    lastAttempt: '2024-01-22 11:35'
  }
];

const mockIntegrationSystems: IntegrationStatus[] = [
  {
    name: 'Система ИД',
    status: 'online',
    lastCheck: '2024-01-22 12:00',
    responseTime: 245,
    uptime: 99.8,
    errorRate: 0.2
  },
  {
    name: 'Система "Объекты"',
    status: 'online', 
    lastCheck: '2024-01-22 12:00',
    responseTime: 120,
    uptime: 99.9,
    errorRate: 0.1
  },
  {
    name: 'Система "Моя компания"',
    status: 'degraded',
    lastCheck: '2024-01-22 12:00',
    responseTime: 850,
    uptime: 95.2,
    errorRate: 4.8
  }
];

const statusConfig = {
  'ready': { label: 'Готово к передаче', color: 'bg-blue-500', icon: Upload },
  'queued': { label: 'В очереди', color: 'bg-gray-500', icon: Clock },
  'sending': { label: 'Передается', color: 'bg-yellow-500', icon: Send },
  'sent_awaiting': { label: 'Передано (ожидает приёма)', color: 'bg-orange-500', icon: Clock },
  'accepted': { label: 'Принято ИД', color: 'bg-green-500', icon: CheckCircle },
  'displayed': { label: 'Отображается в ИД', color: 'bg-green-600', icon: CheckCircle },
  'error': { label: 'Ошибка передачи', color: 'bg-red-500', icon: XCircle },
  'delayed': { label: 'Отложено', color: 'bg-purple-500', icon: AlertCircle },
  'retry_scheduled': { label: 'Повтор запланирован', color: 'bg-yellow-600', icon: RefreshCw }
};

const systemStatusConfig = {
  'online': { label: 'В сети', color: 'bg-green-500', icon: Wifi },
  'offline': { label: 'Недоступна', color: 'bg-red-500', icon: WifiOff },
  'degraded': { label: 'Снижена производительность', color: 'bg-yellow-500', icon: AlertTriangle }
};

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('documents');

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesProject = projectFilter === 'all' || doc.projectName.includes(projectFilter);
    return matchesSearch && matchesStatus && matchesProject;
  });

  const handleRetryDocument = (docId: string) => {
    console.log('Retrying document transmission:', docId);
  };

  const handleViewInID = (idUrl: string) => {
    window.open(idUrl, '_blank');
  };

  const handleRefreshIntegration = () => {
    console.log('Refreshing integration status');
  };

  const stats = {
    total: mockDocuments.length,
    displayed: mockDocuments.filter(d => d.status === 'displayed').length,
    errors: mockDocuments.filter(d => d.status === 'error').length,
    delayed: mockDocuments.filter(d => d.status === 'delayed').length,
    inProgress: mockDocuments.filter(d => ['queued', 'sending', 'sent_awaiting'].includes(d.status)).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мониторинг интеграций</h1>
            <p className="text-gray-600 mt-1">
              Отслеживание состояния интеграций и передачи документов в ИД
            </p>
          </div>
          <Button onClick={handleRefreshIntegration} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Обновить статус</span>
          </Button>
        </div>

        {/* Integration Systems Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockIntegrationSystems.map((system) => {
            const statusInfo = systemStatusConfig[system.status];
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={system.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{system.name}</h3>
                    <Badge className={`${statusInfo.color} text-white`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Время ответа:</span>
                      <span className={system.responseTime > 500 ? 'text-red-600' : 'text-green-600'}>
                        {system.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className={system.uptime < 99 ? 'text-yellow-600' : 'text-green-600'}>
                        {system.uptime}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ошибки:</span>
                      <span className={system.errorRate > 1 ? 'text-red-600' : 'text-green-600'}>
                        {system.errorRate}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Последняя проверка: {system.lastCheck}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="documents">Передача документов</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            <TabsTrigger value="logs">Журнал событий</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Всего документов</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">{stats.displayed}</div>
                  <div className="text-sm text-gray-600">В ИД</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                  <div className="text-sm text-gray-600">В процессе</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                  <div className="text-sm text-gray-600">Ошибки</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-600">{stats.delayed}</div>
                  <div className="text-sm text-gray-600">Отложено</div>
                </CardContent>
              </Card>
            </div>

            {/* Error Alert */}
            {stats.errors > 0 && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Внимание!</strong> {stats.errors} документов не удалось передать в ИД. 
                  Требуется ручное вмешательство для устранения ошибок.
                </AlertDescription>
              </Alert>
            )}

            {/* Filters */}
            <Card className="mb-6">
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
                      <SelectItem value="error">Ошибки</SelectItem>
                      <SelectItem value="delayed">Отложено</SelectItem>
                      <SelectItem value="displayed">В ИД</SelectItem>
                      <SelectItem value="sending">В процессе</SelectItem>
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

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.map((doc) => {
                const statusInfo = statusConfig[doc.status];
                const StatusIcon = statusInfo.icon;
                const hasError = doc.status === 'error';
                const isDelayed = doc.status === 'delayed';
                const needsAction = hasError || isDelayed;

                return (
                  <Card key={doc.id} className={`hover:shadow-lg transition-shadow ${needsAction ? 'border-red-200' : ''}`}>
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
                            {doc.retryCount > 0 && (
                              <Badge variant="secondary">
                                Попытка {doc.retryCount}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Основная информация</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Building2 className="w-3 h-3 mr-2 text-gray-400" />
                                  {doc.projectName}
                                </div>
                                <div className="flex items-center">
                                  <User className="w-3 h-3 mr-2 text-gray-400" />
                                  {doc.authorName}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                  Согласован: {doc.agreedDate}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Статус передачи</div>
                              <div className="space-y-1 text-sm">
                                {doc.exportId && (
                                  <div>ID выгрузки: {doc.exportId}</div>
                                )}
                                <div>Последняя попытка: {doc.lastAttempt}</div>
                                {doc.nextRetry && (
                                  <div className="text-orange-600">
                                    Следующая попытка: {doc.nextRetry}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Дополнительно</div>
                              <div className="space-y-1 text-sm">
                                {doc.errorMessage && (
                                  <div className="text-red-600 font-medium">
                                    {doc.errorMessage}
                                  </div>
                                )}
                                {doc.idUrl && (
                                  <div className="text-green-600">
                                    Доступен в ИД
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-6">
                          {needsAction && (
                            <Button 
                              size="sm" 
                              onClick={() => handleRetryDocument(doc.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Повторить
                            </Button>
                          )}
                          {doc.idUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewInID(doc.idUrl!)}
                            >
                              <Link className="w-4 h-4 mr-2" />
                              Открыть в ИД
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Подробности
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Документы не найдены</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Аналитика передач</h3>
                <p className="text-gray-500">
                  Статистика и графики по передачам документов в ИД, времени обработки, частоте ошибок
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Журнал событий</h3>
                <p className="text-gray-500">
                  Детальный лог всех операций интеграции с временными метками, кодами ответов и деталями ошибок
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
