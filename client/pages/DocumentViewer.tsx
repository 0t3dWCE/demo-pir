import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Download,
  User,
  CalendarDays,
  FileType
} from 'lucide-react';
import { getDocument, approveOrAdvance, pushNotification } from '../../shared/api';

// документ будет загружаться из API по id

const mockComments = [
  {
    id: '1',
    author: 'Анна Смирнова',
    role: 'Заказчик',
    date: '2024-01-16 14:30',
    status: 'open',
    priority: 'high',
    text: 'Высота потолков 2.7м не соответствует техническому заданию. Должно быть 2.8м.',
    position: { x: 250, y: 180 },
    replies: [
      {
        id: '1-1',
        author: 'Петр Иванов',
        role: 'Проектировщик',
        date: '2024-01-16 15:45',
        text: 'Принято к исправлению. Внесу изменения в проект.'
      },
      {
        id: '1-2',
        author: 'Петр Иванов',
        role: 'Проектировщик', 
        date: '2024-01-17 10:20',
        text: 'Исправления внесены. Высота потолков увеличена до 2.8m.'
      }
    ]
  },
  {
    id: '2',
    author: 'Михаил Козлов',
    role: 'Согласующий',
    date: '2024-01-16 16:15',
    status: 'resolved',
    priority: 'medium',
    text: 'Расположение лифтовых шахт не соответствует нормам пожарной безопасности.',
    position: { x: 400, y: 220 },
    replies: [
      {
        id: '2-1',
        author: 'Петр Иванов',
        role: 'Проектировщик',
        date: '2024-01-17 09:30',
        text: 'Проект откорректирован согласно требованиям пожарной безопасности.'
      }
    ]
  }
];

const statusConfig = {
  'open': { label: 'Открыто', color: 'bg-red-500' },
  'in-progress': { label: 'В работе', color: 'bg-yellow-500' },
  'resolved': { label: 'Решено', color: 'bg-green-500' },
  'closed': { label: 'Закрыто', color: 'bg-gray-500' }
};

export default function DocumentViewer() {
  const { id } = useParams();
  const [zoom, setZoom] = useState(100);
  const [doc, setDoc] = useState<any | null>(null);
  const [newComment, setNewComment] = useState('');
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>(mockComments);
  const [hideResolved, setHideResolved] = useState(false);
  const navigate = useNavigate();

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments((prev) => {
        if (activeThreadId) {
          return prev.map((c) =>
            c.id === activeThreadId
              ? { ...c, replies: [ ...(c.replies || []), { id: `${activeThreadId}-${(c.replies?.length || 0) + 1}`, author: 'Текущий пользователь', role: 'Комментарий', date: new Date().toISOString(), text: newComment } ] }
              : c
          );
        }
        // новый тред
        // позиция маркера для нового треда — по центру видимой области (демо)
        const container = document.querySelector('.relative.bg-gray-100.rounded-lg') as HTMLElement | null;
        const rect = container?.getBoundingClientRect();
        const maxX = rect ? Math.max(40, rect.width - 40) : 560;
        const maxY = rect ? Math.max(40, rect.height - 40) : 560;
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);
        const newThread = { id: `${Date.now()}`, author: 'Текущий пользователь', role: 'Комментарий', date: new Date().toISOString(), status: 'open', priority: 'medium', text: newComment, position: { x, y }, replies: [] };
        return [newThread, ...prev];
      });
      setNewComment('');
      setActiveThreadId(null);
    }
  };

  const handleApprove = () => {
    console.log('Document approved');
  };

  const handleReject = () => {
    console.log('Document rejected');
  };

  const handleRequestChanges = () => {
    console.log('Requesting changes');
  };

  // нормальная загрузка документа
  useEffect(() => {
    const resolvedId = id && id.startsWith('doc-') ? id : `doc-${id}`;
    getDocument(resolvedId || 'doc-1').then(setDoc);
  }, [id]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Document Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{doc?.name || ''}</h1>
                  {doc?.status === 'approved' ? (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Согласован
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      На согласовании
                    </Badge>
                  )}
                  {doc?.processInfo && (
                    <span className="text-sm text-gray-600">
                      по процессу — <span className="font-medium">{doc.processInfo.processName}</span>, шаг {doc.processInfo.currentStep} из {doc.processInfo.totalSteps}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{doc?.description}</p>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FileType className="w-4 h-4 mr-2" />
                    <span>{doc?.type} • {doc?.size}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>v{doc?.version} • {doc?.author}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    <span>{doc?.uploadDate}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{doc?.projectId}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 ml-6">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Document Viewer */}
          <div className="col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Просмотр документа</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 min-w-[50px] text-center">{zoom}%</span>
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-100 rounded-lg" style={{ height: '600px' }}>
                  {/* Placeholder for PDF viewer */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">PDF Document Viewer</p>
                      <p className="text-sm text-gray-400 mt-2">
                        В реальном приложении здесь будет отображаться PDF документ
                      </p>
                    </div>
                  </div>
                  
                  {/* Comment markers */}
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="absolute w-6 h-6 bg-red-500 rounded-full cursor-pointer flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      style={{ 
                        left: `${comment.position.x}px`, 
                        top: `${comment.position.y}px`,
                        transform: `scale(${zoom / 100})`
                      }}
                      onClick={() => setSelectedComment(comment)}
                    >
                      <MessageSquare className="w-3 h-3 text-white" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments Panel */}
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="whitespace-nowrap">Обсуждение документа</CardTitle>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{comments.length}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-[10px] text-gray-500 leading-none mb-1 text-right cursor-pointer hover:underline" onClick={() => setHideResolved(!hideResolved)}>
                  {hideResolved ? 'показать решенные' : 'скрыть решенные'}
                </div>
                {/* Comments List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {comments.filter(c => !hideResolved || c.status !== 'resolved').map((comment) => {
                    const statusInfo = statusConfig[comment.status];
                    return (
                      <div
                        key={comment.id}
                        className={`border rounded-lg p-4 cursor-pointer ${activeThreadId === comment.id ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200'}`}
                        onClick={() => setActiveThreadId(activeThreadId === comment.id ? null : comment.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {comment.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{comment.author}</div>
                              <div className="text-xs text-gray-500">{comment.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${statusInfo.color} text-white text-xs`}>
                              {statusInfo.label}
                            </Badge>
                            {comment.status === 'open' && (
                              <Button variant="ghost" size="sm" onClick={() => {
                                setComments(prev => prev.map(c => c.id === comment.id ? { ...c, status: 'resolved' } : c));
                              }}>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{comment.text}</p>
                        <div className="text-xs text-gray-500 mb-3">{comment.date}</div>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-4 border-l-2 border-gray-200 pl-4 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id}>
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">
                                      {reply.author.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium">{reply.author}</span>
                                  <span className="text-xs text-gray-500">{reply.role}</span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.text}</p>
                                <div className="text-xs text-gray-500">{reply.date}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Comment */}
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    {/* убрана выпадайка приоритета */}
                    <Textarea
                      placeholder="Добавить замечание..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddComment} className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Добавить замечание
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleReject}
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Отклонить
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (!id) return;
                      const resolvedId = id.startsWith('doc-') ? id : `doc-${id}`;
                      // debug log: start approve
                      // eslint-disable-next-line no-console
                      console.log('[Approve] click', { id, resolvedId, docBefore: doc });
                      const res = await approveOrAdvance(resolvedId);
                      // eslint-disable-next-line no-console
                      console.log('[Approve] result', res);
                      if (res === 'approved') {
                        const updated = await getDocument(resolvedId);
                        setDoc(updated);
                        // eslint-disable-next-line no-console
                        console.log('[Approve] after approved', updated);
                      } else {
                        pushNotification({ id: `${Date.now()}`, text: 'Документ перешел на следующий шаг согласования', link: `/documents/${resolvedId}` });
                        const updated = await getDocument(resolvedId);
                        setDoc(updated);
                        // eslint-disable-next-line no-console
                        console.log('[Approve] after advance', updated);
                        navigate('/approval');
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Утвердить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
