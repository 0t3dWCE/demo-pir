import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Download,
  MessageSquare,
  User
} from 'lucide-react';
import { listDocuments } from '../../shared/api';

type ApprovalDoc = {
  id: string;
  name: string;
  project: string;
  type: string;
  size: string;
  author: string;
  submittedDate: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  comments: number;
  reviewers: string[];
};

const statusConfig = {
  'pending': { label: 'Ожидает', color: 'bg-yellow-500', icon: Clock },
  'reviewing': { label: 'На рассмотрении', color: 'bg-blue-500', icon: FileText },
  'approved': { label: 'Согласован', color: 'bg-green-500', icon: CheckCircle },
  'rejected': { label: 'Отклонен', color: 'bg-red-500', icon: AlertCircle }
};

const priorityConfig = {
  'low': { label: 'Низкий', color: 'text-gray-600' },
  'medium': { label: 'Средний', color: 'text-yellow-600' },
  'high': { label: 'Высокий', color: 'text-red-600' }
};

export default function Approval() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [approvalDocs, setApprovalDocs] = useState<ApprovalDoc[]>([]);

  useEffect(() => {
    // подгружаем документы из центрального стора и трансформируем
    listDocuments().then((docs) => {
      const mapped: ApprovalDoc[] = (docs as any[]).map((d) => ({
        id: d.id,
        name: d.name,
        project: d.projectId || 'Объект',
        type: d.type,
        size: d.size,
        author: d.author,
        submittedDate: d.uploadDate,
        deadline: '2025-12-31',
        priority: 'medium',
        status: d.status === 'approved' ? 'approved' : 'pending',
        comments: 0,
        reviewers: ['Согласующий']
      }));
      setApprovalDocs(mapped);
    });
  }, []);

  const filteredDocuments = approvalDocs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesProject = projectFilter === 'all' || doc.project === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const stats = {
    total: approvalDocs.length,
    pending: approvalDocs.filter(d => d.status === 'pending').length,
    reviewing: approvalDocs.filter(d => d.status === 'reviewing').length,
    approved: approvalDocs.filter(d => d.status === 'approved').length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Согласование документов</h1>
          <p className="text-gray-600 mt-1">
            Документы, ожидающие вашего согласования
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего документов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Ожидают</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
              <div className="text-sm text-gray-600">На рассмотрении</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Согласовано</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress indicator */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Прогресс согласования</span>
              <span className="text-sm text-gray-600">{stats.approved} из {stats.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{width: `${(stats.approved / stats.total) * 100}%`}}
              ></div>
            </div>
          </CardContent>
        </Card>

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
                  <SelectItem value="pending">Ожидают</SelectItem>
                  <SelectItem value="reviewing">На рассмотрении</SelectItem>
                  <SelectItem value="approved">Согласовано</SelectItem>
                  <SelectItem value="rejected">Отклонено</SelectItem>
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Все проекты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все проекты</SelectItem>
                  <SelectItem value="ЖК «Северный парк»">ЖК «Северный парк»</SelectItem>
                  <SelectItem value="БЦ «Технологический»">БЦ «Технологический»</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents table */}
        <Card>
          <CardHeader>
            <CardTitle>Документы на согласовании</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.map((doc) => {
                const statusInfo = statusConfig[doc.status];
                const priorityInfo = priorityConfig[doc.priority];
                const StatusIcon = statusInfo.icon;
                const isOverdue = new Date(doc.deadline) < new Date() && doc.status !== 'approved';

                return (
                  <div key={doc.id} className={`p-4 border rounded-lg hover:bg-gray-50 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{doc.name}</h3>
                          <Badge className={`${statusInfo.color} text-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <span className={`text-sm font-medium ${priorityInfo.color}`}>
                            {priorityInfo.label} приоритет
                          </span>
                          {isOverdue && (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Просрочено
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Проект:</span> {doc.project}
                          </div>
                          <div>
                            <span className="font-medium">Автор:</span> {doc.author}
                          </div>
                          <div>
                            <span className="font-medium">Размер:</span> {doc.size}
                          </div>
                          <div>
                            <span className="font-medium">Срок:</span> {doc.deadline}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>Согласующие: {doc.reviewers.join(', ')}</span>
                          </div>
                          {doc.comments > 0 && (
                            <div className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              <span>{doc.comments} замечаний</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </Button>
                        <Link to={`/documents/${doc.id}`}>
                          <Button size="sm">
                            Открыть
                          </Button>
                        </Link>
                        {doc.status === 'pending' && (
                          <Link to={`/documents/${doc.id}`}>
                            <Button variant="outline" size="sm">
                              Начать рассмотрение
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Документы не найдены</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
