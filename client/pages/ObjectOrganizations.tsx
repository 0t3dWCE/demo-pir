import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getProjectCompanies, getProjectMeta, getProjectExternalId, getObjectCompanies, setProjectCompanies, removeOrganizationFromProject } from '../../shared/api';
import { Building, Users, Search, ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useRole } from '../contexts/RoleContext';

export default function ObjectOrganizations() {
  const { id } = useParams();
  const { currentUser } = useRole();
  const [objectName, setObjectName] = useState('');
  const [orgs, setOrgs] = useState<Array<{ name: string; inn: string; kpp?: string; address?: string; roles: string[]; contractNumbers: string[] }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [externalCompanies, setExternalCompanies] = useState<typeof orgs>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    const meta = getProjectMeta(id);
    if (meta) setObjectName(meta.name);
    (async () => {
      const companies = await getProjectCompanies(id);
      setOrgs(companies);
    })();
  }, [id]);

  useEffect(() => {
    // при открытии диалога подтягиваем актуальные компании из ИД для объекта
    const loadExternal = async () => {
      if (!id || !isAddDialogOpen) return;
      setCompaniesLoading(true);
      try {
        const externalId = getProjectExternalId(id) || id; // если есть связь — по ней, иначе попробуем id
        const companies = await getObjectCompanies(externalId);
        setExternalCompanies(companies as any);
        const initial: Record<string, boolean> = {};
        companies.forEach((c: any) => { initial[c.inn] = true; });
        setSelectedCompanies(initial);
      } finally {
        setCompaniesLoading(false);
      }
    };
    loadExternal();
  }, [id, isAddDialogOpen]);

  const filtered = useMemo(() => {
    return orgs.filter(o =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.inn.includes(searchTerm) ||
      (o.address || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orgs, searchTerm]);

  const handleRemoveOrganization = async (inn: string) => {
    if (!id) return;
    if (typeof window !== 'undefined' && !confirm('Удалить организацию из объекта?')) return;
    await removeOrganizationFromProject(id, inn);
    const refreshed = await getProjectCompanies(id);
    setOrgs(refreshed as any);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2">
          <Link to="/objects" className="flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Объекты
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{objectName || 'Объект'}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Организации</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Организации объекта</h1>
            <p className="text-gray-600 mt-1">Всего: {filtered.length}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Добавить организацию</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <ExternalLink className="w-5 h-5" />
                  <span>Добавить организацию из системы ИД</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">Доступные компании по договорам выбранного объекта</div>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {companiesLoading ? (
                    <div className="text-sm text-gray-500">Загрузка компаний...</div>
                  ) : (
                    externalCompanies.map((c) => (
                      <Card key={c.inn}>
                        <CardContent className="p-4">
                          <label className="flex items-start space-x-3">
                            <Checkbox
                              checked={!!selectedCompanies[c.inn]}
                              onCheckedChange={(val) => setSelectedCompanies((prev) => ({ ...prev, [c.inn]: Boolean(val) }))}
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
                          </label>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
                  <Button onClick={() => {
                    if (!id) return;
                    const toAdd = externalCompanies.filter(c => selectedCompanies[c.inn]);
                    const mergedMap: Record<string, typeof toAdd[number]> = {};
                    [...orgs, ...toAdd].forEach((c) => { mergedMap[c.inn] = c; });
                    const merged = Object.values(mergedMap);
                    setProjectCompanies(id, merged as any);
                    setOrgs(merged as any);
                    setIsAddDialogOpen(false);
                  }}>Добавить выбранные</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по названию, ИНН, адресу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orgs list */}
        <div className="space-y-4">
          {filtered.map((org) => (
            <Card key={org.inn} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Building className="w-6 h-6 text-gray-400" />
                      <h3 className="text-xl font-semibold">{org.name}</h3>
                      <Badge variant="outline">ИНН: {org.inn}{org.kpp ? ` / КПП: ${org.kpp}` : ''}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Роли</div>
                        <div className="flex flex-wrap gap-2">
                          {org.roles.map((r) => (
                            <Badge key={r} variant="secondary">{r}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Договоры</div>
                        <div className="flex flex-wrap gap-2">
                          {org.contractNumbers.map((n) => (
                            <Badge key={n} variant="secondary">{n}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Адрес</div>
                        <div className="text-sm text-gray-700">{org.address || '—'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 ml-6 space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Сотрудники формируются по ролям</span>
                    {currentUser.role === 'root-admin' && (
                      <Button
                        variant="outline"
                        className="ml-4 text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleRemoveOrganization(org.inn)}
                        title="Удалить организацию из объекта"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Организации не найдены</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


