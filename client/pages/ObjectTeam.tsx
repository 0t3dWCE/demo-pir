import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProjectCompanies, getProjectMeta, getEmployeesForCompanies, getObjectFolderPaths, getProjectEmployees, setProjectEmployees, getProjectNewCompanies, clearProjectCompanyNewFlag, getCompanyStructure } from '../../shared/api';
import { Users, ArrowLeft, Building2, Search } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';

type RoleKey = 'signatory' | 'reviewer' | 'observer' | 'editor' | 'deleter';

export default function ObjectTeam() {
  const { id } = useParams();
  const { currentUser } = useRole();
  const [objectName, setObjectName] = useState<string>('');
  const [employees, setEmployees] = useState<Array<{
    id: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    companyInn: string;
    companyName: string;
    isCompanyAdmin?: boolean;
    departmentPath?: string;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleAssignments, setRoleAssignments] = useState<Record<string, { roleFolders: Record<RoleKey, string[]> }>>({});
  const [allFolders] = useState<string[]>(getObjectFolderPaths());
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [openPickers, setOpenPickers] = useState<Record<string, boolean>>({});
  const [companies, setCompanies] = useState<{ inn: string; name: string; isNew: boolean }[]>([]);
  const [selectedCompanyInn, setSelectedCompanyInn] = useState<string | null>(null);
  const [companyUnits, setCompanyUnits] = useState<Array<{ name: string; children?: any[] }>>([]);
  const [showAllEmployees, setShowAllEmployees] = useState<boolean>(false);
  const [selectedUnitPath, setSelectedUnitPath] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const meta = getProjectMeta(id);
    if (meta) setObjectName(meta.name);
    (async () => {
      // Компании и флаг "новая"
      const comps = await getProjectCompanies(id);
      const newInns = getProjectNewCompanies(id) || [];
      const compList = comps.map(c => ({ inn: c.inn, name: c.name, isNew: newInns.includes(c.inn) }));
      compList.sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.name.localeCompare(b.name));
      setCompanies(compList);
      if (!selectedCompanyInn && compList[0]) {
        // Выбор компании по умолчанию. Для администратора компании выбираем его компанию.
        if (currentUser.role === 'company-admin') {
          const target = compList.find(c => {
            const a = (c.name || '').toLowerCase();
            const b = (currentUser.company || '').toLowerCase();
            return a.includes(b) || b.includes(a);
          }) || compList[0];
          setSelectedCompanyInn(target.inn);
        } else {
          setSelectedCompanyInn(compList[0].inn);
        }
      }

      // Сотрудники (кэш или генерация)
      const cached = await getProjectEmployees(id);
      let emps = cached;
      if (!cached || cached.length === 0) {
        const companiesData = await getProjectCompanies(id);
        emps = await getEmployeesForCompanies(companiesData);
        setProjectEmployees(id, emps);
      }
      setEmployees(emps);
      const initial: Record<string, { roleFolders: Record<RoleKey, string[]> }> = {};
      emps.forEach((e) => {
        initial[e.id] = { roleFolders: { observer: ['Все папки'] } as Record<RoleKey, string[]> };
      });
      setRoleAssignments(initial);
      if (!activeEmployeeId && emps[0]) setActiveEmployeeId(emps[0].id);
    })();
  }, [id]);

  // При выборе компании подгружаем её дерево подразделений и сбрасываем фильтры
  useEffect(() => {
    if (!selectedCompanyInn) return;
    const tree = getCompanyStructure(selectedCompanyInn);
    setCompanyUnits(tree);
    setSelectedUnitPath(null);
    setShowAllEmployees(false);
    if (id && selectedCompanyInn) clearProjectCompanyNewFlag(id, selectedCompanyInn);
  }, [selectedCompanyInn]);

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
        roleFolders[role] = ['Все папки'];
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

        <div className="grid grid-cols-12 gap-6">
          {/* Companies left column (скрыто для администратора компании) */}
          {currentUser.role !== 'company-admin' && (
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Компании-участники</div>
                <div className="space-y-1">
                  {companies.map((c) => (
                    <button
                      key={c.inn}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${selectedCompanyInn === c.inn ? 'bg-gray-100 font-medium' : ''}`}
                      onClick={() => setSelectedCompanyInn(c.inn)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{c.name}</span>
                        {c.isNew && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">новая</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">ИНН {c.inn}</div>
                    </button>
                  ))}
                  {companies.length === 0 && (
                    <div className="text-sm text-gray-500">Компании не найдены</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Company units middle column */}
          <div className={`col-span-12 ${currentUser.role === 'company-admin' ? 'md:col-span-5 lg:col-span-4 xl:col-span-4' : 'md:col-span-4 lg:col-span-4 xl:col-span-3' }`}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-500">Подразделения</div>
                  <label className="flex items-center space-x-2 text-xs">
                    <Checkbox
                      checked={showAllEmployees}
                      onCheckedChange={(v) => setShowAllEmployees(Boolean(v))}
                    />
                    <span>Показать всех</span>
                  </label>
                </div>
                {!showAllEmployees && (
                  <div className="max-h-[60vh] overflow-y-auto space-y-1">
                    {selectedCompanyInn ? (
                      <div className="space-y-0.5">
                        {(() => {
                          const items: JSX.Element[] = [];
                          const walk = (
                            node: { name: string; children?: any[] },
                            prefix: string[],
                            depth: number
                          ) => {
                            const here = [...prefix, node.name];
                            const path = here.join(' / ');
                            items.push(
                              <button
                                key={path}
                                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedUnitPath === path ? 'bg-gray-100 font-medium' : ''}`}
                                onClick={() => setSelectedUnitPath(path)}
                              >
                                <span className="text-sm" style={{ paddingLeft: depth * 8 }}>{node.name}</span>
                              </button>
                            );
                            node.children?.forEach((ch) => walk(ch, here, depth + 1));
                          };
                          companyUnits.forEach((root) => walk(root, [], 0));
                          return items;
                        })()}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Выберите компанию</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Employees list right column */}
          <div className={`col-span-12 ${currentUser.role === 'company-admin' ? 'md:col-span-7 lg:col-span-8 xl:col-span-8' : 'md:col-span-4 lg:col-span-5 xl:col-span-6'} space-y-4`}>
          {filtered
            .filter((emp) => {
              if (!selectedCompanyInn) return true;
              if (emp.companyInn !== selectedCompanyInn) return false;
              if (showAllEmployees) return true;
              if (!selectedUnitPath) return false;
              return (emp.departmentPath || '').startsWith(selectedUnitPath);
            })
            .map((emp) => {
            const isActive = activeEmployeeId === emp.id;
            return (
            <Card key={emp.id} className={`hover:shadow-lg transition-shadow cursor-pointer ${isActive ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setActiveEmployeeId(emp.id)}>
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

                    <div className={`grid grid-cols-1 gap-4 ${isActive ? '' : 'opacity-60'}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">Роли</div>
                        {!isActive && (
                          <div className="text-xs text-gray-500 mb-2">Нажмите на карточку, чтобы выбрать сотрудника</div>
                        )}
                        <div className={`space-y-3 ${isActive ? '' : 'pointer-events-none'}`}>
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
                                    {role === 'signatory' ? 'подписант' : role === 'reviewer' ? 'проверяющий' : role === 'observer' ? 'наблюдающий' : role === 'editor' ? 'редактирование' : 'чтение'}
                                  </span>
                                  {Boolean(roleAssignments[emp.id]?.roleFolders?.[role]) && (
                                    <span className="text-xs text-gray-500">({label})</span>
                                  )}
                                  {Boolean(roleAssignments[emp.id]?.roleFolders?.[role]) && (
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
          );})}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Сотрудники не найдены</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


