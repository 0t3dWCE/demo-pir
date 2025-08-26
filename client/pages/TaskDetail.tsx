import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { listProjects, getProjectAssignees, AssigneeInfo, getProjectDocuments, SimpleDocument } from '../../shared/api';
import { FileText, MessageSquare, History, List, CheckCircle, ArrowRight } from 'lucide-react';

interface TaskPayload {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  assigneeId?: string;
  assignee?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  relatedDocuments?: string[];
}

export default function TaskDetail() {
  const { id } = useParams();
  const location = useLocation();
  const fromState = (location.state as any)?.task as TaskPayload | undefined;

  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [assignees, setAssignees] = useState<AssigneeInfo[]>([]);
  const [docs, setDocs] = useState<SimpleDocument[]>([]);

  const [title, setTitle] = useState(fromState?.title || '');
  const [description, setDescription] = useState(fromState?.description || '');
  const [projectId, setProjectId] = useState<string | undefined>(fromState?.projectId || undefined);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState(fromState?.dueDate || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(fromState?.priority || 'medium');
  const [selectedDocIds, setSelectedDocIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('fields');
  const [status, setStatus] = useState<( 'draft' | 'in-progress' | 'under-review' | 'completed' | 'cancelled' | 'overdue')>( (fromState as any)?.status || 'draft');

  useEffect(() => {
    setAvailableProjects(listProjects());
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!projectId) return;
      const a = await getProjectAssignees(projectId);
      setAssignees(a);
      const rpp = a.find(x => x.isRpp);
      setAssigneeId(fromState?.assigneeId || rpp?.id);

      const d = await getProjectDocuments(projectId);
      setDocs(d);
      const initial: Record<string, boolean> = {};
      d.forEach(doc => { initial[doc.id] = fromState?.relatedDocuments?.includes(doc.name) || false; });
      setSelectedDocIds(initial);
    };
    run();
  }, [projectId]);

  const historyRows = useMemo(() => {
    if (!fromState) return [{ author: 'Система', date: new Date().toISOString().slice(0,10), decision: 'создано' }];
    if ((fromState as any).history) return (fromState as any).history;
    return [{ author: 'Система', date: fromState.createdDate || new Date().toISOString().slice(0,10), decision: 'создано' }];
  }, [fromState]);

  const comments = useMemo(() => {
    const list = (fromState as any)?.commentsList as Array<{author:string;date:string;text:string}> | undefined;
    return list || [];
  }, [fromState]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Поручение</h1>
            <p className="text-gray-600 mt-1">ID: {id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${status === 'draft' ? 'text-gray-600' : status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'}`}>
              Статус: {status === 'draft' ? 'Черновик' : status === 'in-progress' ? 'В работе' : status}
            </span>
            {status === 'draft' && (
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => setStatus('in-progress')}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Отправить в работу
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="fields">Поля</TabsTrigger>
            <TabsTrigger value="comments">Комментарии</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <List className="w-5 h-5" />
                  <span>Данные поручения</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Заголовок *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="desc">Описание *</Label>
                  <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Объект *</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
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
                    <Label>Срок выполнения *</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Исполнитель *</Label>
                    <Select value={assigneeId} onValueChange={setAssigneeId} disabled={!projectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите исполнителя" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignees.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name} {a.isRpp ? '(РПП)' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Приоритет</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
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
                  <Label>Связанные документы</Label>
                  <div className="border rounded-md p-3 max-h-56 overflow-y-auto">
                    {projectId ? (
                      docs.length > 0 ? (
                        docs.map(doc => (
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Комментарии</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-sm text-gray-600">Комментариев пока нет</div>
                  ) : (
                    <div className="space-y-2">
                      {comments.map((c, idx) => (
                        <div key={idx} className="p-2 border rounded">
                          <div className="text-sm font-medium">{c.author} • <span className="text-gray-500">{c.date}</span></div>
                          <div className="text-sm text-gray-700">{c.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Textarea placeholder="Добавить комментарий..." rows={3} />
                  <div className="flex justify-end">
                    <Button size="sm">Добавить</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>История изменений</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="p-2">Автор</th>
                        <th className="p-2">Дата</th>
                        <th className="p-2">Решение</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{row.author}</td>
                          <td className="p-2">{row.date}</td>
                          <td className="p-2">{row.decision}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}


