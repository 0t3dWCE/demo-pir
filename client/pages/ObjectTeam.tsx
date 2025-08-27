import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProjectCompanies, getProjectMeta, getEmployeesForCompanies, getObjectFolderPaths, getProjectEmployees, setProjectEmployees } from '../../shared/api';
import { Users, ArrowLeft, Building2, Search } from 'lucide-react';

type RoleKey = 'signatory' | 'reviewer' | 'observer' | 'editor' | 'deleter';

export default function ObjectTeam() {
  const { id } = useParams();
  const [objectName, setObjectName] = useState<string>('');
  const [employees, setEmployees] = useState<Array<{
    id: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    companyInn: string;
    companyName: string;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleAssignments, setRoleAssignments] = useState<Record<string, { roleFolders: Record<RoleKey, string[]> }>>({});
  const [allFolders] = useState<string[]>(getObjectFolderPaths());
  const [openPickers, setOpenPickers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    const meta = getProjectMeta(id);
    if (meta) setObjectName(meta.name);
    (async () => {
      // сначала пытаемся взять кэш сотрудников, если есть; иначе генерируем по компаниям
      const cached = await getProjectEmployees(id);
      let emps = cached;
      if (!cached || cached.length === 0) {
        const companies = await getProjectCompanies(id);
        emps = await getEmployeesForCompanies(companies);
        setProjectEmployees(id, emps);
      }
      setEmployees(emps);
      const initial: Record<string, { roleFolders: Record<RoleKey, string[]> }> = {};
      emps.forEach((e) => {
        initial[e.id] = { roleFolders: { observer: ['Все папки'] } as Record<RoleKey, string[]> };
      });
      setRoleAssignments(initial);
    })();
  }, [id]);

  const filtered = useMemo(() => {
    return employees.filter(e =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const toggleRole = (empId: string, role: RoleKey, checked: boolean) => {
    setRoleAssignments((prev) => {
      const current = prev[empId] || { roleFolders: {} as Record<RoleKey, string[]> };
      const roleFolders = { ...(current.roleFolders || {}) } as Record<RoleKey, string[]>;
      if (checked) {
        if (!roleFolders[role] || roleFolders[role].length === 0) {
          roleFolders[role] = ['Все папки'];
        }
      } else {
        delete roleFolders[role];
      }
      return { ...prev, [empId]: { roleFolders } };
    });
  };

  const toggleFolderForRole = (empId: string, role: RoleKey, folder: string, checked: boolean) => {
    setRoleAssignments((prev) => {
      const current = prev[empId] || { roleFolders: {} as Record<RoleKey, string[]> };
      const roleFolders = { ...(current.roleFolders || {}) } as Record<RoleKey, string[]>;
      const existing = new Set(roleFolders[role] || []);
      // обработка специального пункта "Все папки"
      if (folder === 'Все папки') {
        if (checked) {
          roleFolders[role] = ['Все папки'];
        } else {
          // снятие галки со "Все папки" просто очищает роль
          delete roleFolders[role];
        }
        return { ...prev, [empId]: { roleFolders } };
      }

      // сбор всех потомков выбранной папки (включая её саму)
      const descendants = allFolders.filter((p) => p === folder || p.startsWith(folder + ' / '));

      if (checked) {
        existing.delete('Все папки');
        descendants.forEach((d) => existing.add(d));
      } else {
        descendants.forEach((d) => existing.delete(d));
      }

      roleFolders[role] = Array.from(existing);
      if (roleFolders[role].length === 0) {
        delete roleFolders[role];
      }
      return { ...prev, [empId]: { roleFolders } };
    });
  };

  const getRoleFoldersLabel = (empId: string, role: RoleKey): string => {
    const folders = roleAssignments[empId]?.roleFolders?.[role];
    if (!folders || folders.length === 0) return '';
    if (folders.includes('Все папки')) return 'Все папки';
    return folders.join(', ');
  };

  const togglePickerOpen = (empId: string, role: RoleKey) => {
    const key = `${empId}:${role}`;
    setOpenPickers((prev) => ({ ...prev, [key]: !prev[key] }));
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
          <span className="text-gray-900">Команда</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Команда объекта</h1>
            <p className="text-gray-600 mt-1">Участвует в объектах: {objectName || '—'}</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск сотрудников..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees */}
        <div className="space-y-4">
          {filtered.map((emp) => (
            <Card key={emp.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-medium">
                      {emp.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{emp.name}</h3>
                      <Badge className="bg-gray-500 text-white">{emp.position}</Badge>
                      {emp.isCompanyAdmin && (
                        <Badge className="bg-orange-500 text-white">Администратор компании</Badge>
                      )}
                      <Badge className="bg-purple-500 text-white">
                        <Building2 className="w-3 h-3 mr-1" />
                        {emp.companyName}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{emp.email} • {emp.phone}</div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">Роли</div>
                        <div className="space-y-3">
                          {(['signatory', 'reviewer', 'observer', 'editor', 'deleter'] as RoleKey[]).map((role) => {
                            const key = `${emp.id}:${role}`;
                            const enabled = Boolean(roleAssignments[emp.id]?.roleFolders?.[role]);
                            const label = getRoleFoldersLabel(emp.id, role);
                            return (
                              <div key={role}>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={enabled}
                                    onCheckedChange={(val) => toggleRole(emp.id, role, Boolean(val))}
                                  />
                                  <span className="text-sm capitalize">
                                    {role === 'signatory' ? 'подписант' : role === 'reviewer' ? 'проверяющий' : role === 'observer' ? 'наблюдающий' : role === 'editor' ? 'редактирование/изменение' : 'удаление'}
                                  </span>
                                  {enabled && (
                                    <span className="text-xs text-gray-500">({label})</span>
                                  )}
                                  {enabled && (
                                    <button
                                      type="button"
                                      onClick={() => togglePickerOpen(emp.id, role)}
                                      className="text-xs text-blue-600 ml-2 hover:underline"
                                    >
                                      Настроить папки
                                    </button>
                                  )}
                                </div>
                                {enabled && openPickers[key] && (
                                  <div className="mt-2 ml-6 p-2 border rounded bg-gray-50 max-h-40 overflow-y-auto">
                                    <label className="flex items-center space-x-2 mb-2">
                                      <Checkbox
                                        checked={Boolean(roleAssignments[emp.id]?.roleFolders?.[role]?.includes('Все папки'))}
                                        onCheckedChange={(val) => toggleFolderForRole(emp.id, role, 'Все папки', Boolean(val))}
                                      />
                                      <span className="text-sm">Все папки</span>
                                    </label>
                                    {allFolders.map((p) => (
                                      <label key={p} className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={Boolean(roleAssignments[emp.id]?.roleFolders?.[role]?.includes(p))}
                                          onCheckedChange={(val) => toggleFolderForRole(emp.id, role, p, Boolean(val))}
                                        />
                                        <span className="text-sm">{p}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Сотрудники не найдены</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


