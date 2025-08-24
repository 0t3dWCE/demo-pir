import { useState, useMemo, useEffect } from 'react';
import Layout from '../components/Layout';
import ProjectCard, { Project } from '../components/ProjectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ExternalLink, Building2 } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { getObjectCompanies, CompanyAggregated, setProjectCompanies, setProjectMeta } from '../../shared/api';
import { Checkbox } from '@/components/ui/checkbox';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'ЖК «Северный парк»',
    description: 'Жилой комплекс премиум-класса, 25 этажей',
    status: 'on-approval',
    progress: 75,
    location: 'г. Москва, Северный округ',
    deadline: '31.12.2025',
    documentsCount: 124,
    teamSize: 8
  },
  {
    id: '2', 
    name: 'БЦ «Технологический»',
    description: 'Офисный центр класса А, 15 этажей',
    status: 'in-progress',
    progress: 45,
    location: 'г. Санкт-Петербург, Василеостровский район',
    deadline: '20.03.2024',
    documentsCount: 89,
    teamSize: 6
  },
  {
    id: '3',
    name: 'ТРК «Галерея»',
    description: 'Торгово-развлекательный комплекс, 4 этажа',
    status: 'approved',
    progress: 100,
    location: 'г. Екатеринбург, центр',
    deadline: '10.01.2024',
    documentsCount: 156,
    teamSize: 12
  },
  {
    id: '4',
    name: 'ЖК «Рассветный»',
    description: 'Жилой комплекс эконом-класса, 12 этажей',
    status: 'draft',
    progress: 20,
    location: 'г. Казань, Приволжский район',
    deadline: '30.11.2025',
    documentsCount: 45,
    teamSize: 4
  },
  {
    id: '5',
    name: 'Логистический центр',
    description: 'Складской комплекс класса А, 3 этажа',
    status: 'rejected',
    progress: 60,
    location: 'Московская область, Подольск',
    deadline: '15.12.2025',
    documentsCount: 78,
    teamSize: 5
  },
  {
    id: '6',
    name: 'Детский сад «Солнышко»',
    description: 'Дошкольное образовательное учреждение на 120 мест',
    status: 'in-progress',
    progress: 35,
    location: 'г. Нижний Новгород, Автозаводский район',
    deadline: '20.12.2025',
    documentsCount: 67,
    teamSize: 7
  }
];

export default function Index() {
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [objects, setObjects] = useState<Project[]>(mockProjects);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [externalSearchTerm, setExternalSearchTerm] = useState('');
  const [selectedExternalObjectId, setSelectedExternalObjectId] = useState<string | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyAggregated[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Record<string, boolean>>({});

  const filteredObjects = objects.filter(object => {
    const matchesSearch = object.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         object.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || object.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canCreateObject = currentUser.role === 'root-admin';

  // Mock external objects from "Objects" system
  const mockExternalObjects = [
    {
      id: 'ext-obj-1',
      name: 'ЖК «Восточная резиденция»',
      description: 'Жилой комплекс бизнес-класса, 18 этажей',
      location: 'г. Москва, ВАО',
      type: 'Жилое строительство',
      area: '45000 м²',
      floors: 18,
      isExternal: true
    },
    {
      id: 'ext-obj-2',
      name: 'БЦ «Инновация Плаза»',
      description: 'Современный бизнес-центр класса А',
      location: 'г. Санк��-Петербург, Центральный район',
      type: 'Коммерческое строительство',
      area: '25000 м²',
      floors: 12,
      isExternal: true
    },
    {
      id: 'ext-obj-3',
      name: 'Логистический комплекс «Автодор»',
      description: 'Складско-логистический центр',
      location: 'Московская область, г. Домодедово',
      type: 'Промышленное строительство',
      area: '60000 м²',
      floors: 3,
      isExternal: true
    },
    {
      id: 'ext-obj-4',
      name: 'Школа №125',
      description: 'Общеобразовательное учреждение на 800 учащихся',
      location: 'г. Казань, Советский район',
      type: 'Социальное строительство',
      area: '8000 м²',
      floors: 4,
      isExternal: true
    }
  ];

  const filteredExternalObjects = useMemo(() =>
    mockExternalObjects.filter(obj =>
      obj.name.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
      obj.description.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
      obj.location.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
      obj.type.toLowerCase().includes(externalSearchTerm.toLowerCase())
    ),
    [externalSearchTerm]
  );

  const handlePickExternalObject = async (extObj: any) => {
    setSelectedExternalObjectId(extObj.id);
    setCompaniesLoading(true);
    try {
      const items = await getObjectCompanies(extObj.id);
      setCompanies(items);
      // По умолчанию все выбраны
      const initial: Record<string, boolean> = {};
      items.forEach((c) => { initial[c.inn] = true; });
      setSelectedCompanies(initial);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const toggleCompany = (inn: string, checked: boolean) => {
    setSelectedCompanies((prev) => ({ ...prev, [inn]: checked }));
  };

  const handleConfirmAdd = () => {
    if (!selectedExternalObjectId) return;
    const chosen = companies.filter(c => selectedCompanies[c.inn]);
    // Здесь затем будет вызов серверного API для создания/привязки объекта и компаний
    console.log('Confirm add object', { objectId: selectedExternalObjectId, companies: chosen });

    // Добавляем карточку объекта на главную страницу
    const extObj = mockExternalObjects.find(o => o.id === selectedExternalObjectId);
    if (extObj) {
      const newId = `ext-${Date.now()}`;
      const newProject: Project = {
        id: newId,
        name: extObj.name,
        description: extObj.description,
        status: 'in-progress',
        progress: 0,
        location: extObj.location,
        deadline: '—',
        documentsCount: 0,
        teamSize: 0
      };
      setObjects(prev => [newProject, ...prev]);
      // сохраняем компании и метаданные для страницы команды
      setProjectCompanies(newId, chosen);
      setProjectMeta(newId, extObj.name);
    }
    // Сброс состояния и закрытие
    setSelectedExternalObjectId(null);
    setCompanies([]);
    setSelectedCompanies({});
    setIsAddDialogOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6 stable-layout">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Объекты</h1>
            <p className="text-gray-600 mt-1">
              Управление объектами строительства
            </p>
          </div>
          {canCreateObject && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Добавить объект</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto stable-layout">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <ExternalLink className="w-5 h-5" />
                    <span>Добавить объект из системы "Объекты"</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Шаг 1: выбор объекта */}
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Поиск по названию, описанию или типу..."
                        value={externalSearchTerm}
                        onChange={(e) => setExternalSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto mt-3 optimized-container">
                      {filteredExternalObjects.map((obj) => (
                        <Card key={obj.id} className={`transition-shadow ${selectedExternalObjectId === obj.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-1">{obj.name}</h3>
                                  <p className="text-sm text-gray-600 mb-2">{obj.description}</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                    <div><strong>Местоположение:</strong> {obj.location}</div>
                                    <div><strong>Площадь:</strong> {obj.area}</div>
                                    <div><strong>Этажность:</strong> {obj.floors} этажей</div>
                                    <div>
                                      <Badge variant="outline" className="text-xs">
                                        {obj.type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button onClick={() => handlePickExternalObject(obj)} className="ml-4">
                                Выбрать
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredExternalObjects.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>Объекты не найдены</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Шаг 2: компании по договорам выбранного объекта */}
                  {selectedExternalObjectId && (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700 font-medium">Компании по договорам выбранного объекта</div>
                      {companiesLoading ? (
                        <div className="text-sm text-gray-500">Загрузка компаний...</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                          {companies.map((c) => (
                            <Card key={c.inn} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <Checkbox
                                    checked={!!selectedCompanies[c.inn]}
                                    onCheckedChange={(val) => toggleCompany(c.inn, Boolean(val))}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-gray-900">{c.name}</div>
                                      <div className="text-xs text-gray-500">{c.roles.join(', ')}</div>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      ИНН: {c.inn}{c.kpp ? ` / КПП: ${c.kpp}` : ''}
                                    </div>
                                    {c.address && (
                                      <div className="text-xs text-gray-600">{c.address}</div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">Договоры: {c.contractNumbers.join(', ')}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {companies.length === 0 && (
                            <div className="text-sm text-gray-500">Данные о компаниях не найдены</div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" onClick={() => { setSelectedExternalObjectId(null); setCompanies([]); setSelectedCompanies({}); }}>
                          Назад к выбору объекта
                        </Button>
                        <Button onClick={handleConfirmAdd} disabled={companiesLoading || companies.length === 0}>
                          Добавить выбранные
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск объектов..."
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
              <SelectItem value="on-approval">На со��ласовании</SelectItem>
              <SelectItem value="approved">Согласован</SelectItem>
              <SelectItem value="rejected">Отклонен</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">По приоритету</SelectItem>
              <SelectItem value="deadline">По сроку</SelectItem>
              <SelectItem value="progress">По прогрессу</SelectItem>
              <SelectItem value="name">По названию</SelectItem>
            </SelectContent>
          </Select>
        </div>

        

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 optimized-container">
          {filteredObjects.map((object) => (
            <ProjectCard key={object.id} project={object} />
          ))}
        </div>

        {filteredObjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Объекты не найдены</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
