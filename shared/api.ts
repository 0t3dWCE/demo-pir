/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// ------------------ PIRNEW: Мок-API для системы ИД ------------------

export type CompanyRole = 'технический заказчик' | 'проектировщик';

export interface CompanyRequisites {
  name: string;
  inn: string;
  kpp?: string;
  address?: string;
}

export interface CompanyAggregated extends CompanyRequisites {
  roles: CompanyRole[];
  contractNumbers: string[];
}

interface ContractParticipant {
  role: CompanyRole;
  company: CompanyRequisites;
}

interface ObjectContractInfo {
  objectId: string;
  contractNumber: string;
  participants: ContractParticipant[];
}

// Набор мок-данных: контракты и участники по объектам из системы ИД
const MOCK_OBJECT_CONTRACTS: ObjectContractInfo[] = [
  {
    objectId: 'ext-obj-1',
    contractNumber: 'ДП-2024-001',
    participants: [
      {
        role: 'технический заказчик',
        company: {
          name: 'ООО «ТехЗаказ Девелопмент»',
          inn: '7701234567',
          kpp: '770101001',
          address: '125009, г. Москва, ул. Тверская, д. 1'
        }
      },
      {
        role: 'проектировщик',
        company: {
          name: 'ООО «ПроектСтрой»',
          inn: '7812345678',
          kpp: '781201001',
          address: '191025, г. Санкт-Петербург, Невский пр., д. 10'
        }
      }
    ]
  },
  {
    objectId: 'ext-obj-1',
    contractNumber: 'ДП-2025-003',
    participants: [
      {
        role: 'технический заказчик',
        company: {
          name: 'ООО «ТехЗаказ Девелопмент»',
          inn: '7701234567',
          kpp: '770101001',
          address: '125009, г. Москва, ул. Тверская, д. 1'
        }
      },
      {
        role: 'проектировщик',
        company: {
          name: 'АО «АрхИнжиниринг»',
          inn: '5409876543',
          kpp: '540901001',
          address: '630099, г. Новосибирск, ул. Ленина, д. 25'
        }
      }
    ]
  },
  {
    objectId: 'ext-obj-2',
    contractNumber: 'ДП-2024-010',
    participants: [
      {
        role: 'технический заказчик',
        company: {
          name: 'ООО «Север Кэпитал»',
          inn: '7812001122',
          kpp: '781201002',
          address: '191186, г. Санкт-Петербург, Дворцовая наб., д. 2'
        }
      },
      {
        role: 'проектировщик',
        company: {
          name: 'ООО «ПроектСтрой»',
          inn: '7812345678',
          kpp: '781201001',
          address: '191025, г. Санкт-Петербург, Невский пр., д. 10'
        }
      }
    ]
  },
  {
    objectId: 'ext-obj-3',
    contractNumber: 'ДП-2023-077',
    participants: [
      {
        role: 'технический заказчик',
        company: {
          name: 'ООО «Логистик Групп»',
          inn: '5001234500',
          kpp: '500101001',
          address: '142000, Московская обл., г. Домодедово, пр-т Ленина, д. 7'
        }
      },
      {
        role: 'проектировщик',
        company: {
          name: 'АО «АрхИнжиниринг»',
          inn: '5409876543',
          kpp: '540901001',
          address: '630099, г. Новосибирск, ул. Ленина, д. 25'
        }
      }
    ]
  },
  {
    objectId: 'ext-obj-3',
    contractNumber: 'ДП-2024-022',
    participants: [
      {
        role: 'проектировщик',
        company: {
          name: 'ООО «ПроектСтрой»',
          inn: '7812345678',
          kpp: '781201001',
          address: '191025, г. Санкт-Петербург, Невский пр., д. 10'
        }
      }
    ]
  }
];

/**
 * Возвращает агрегированный список компаний по объекту из системы ИД.
 * Компании агрегируются по ИНН: роли и номера договоров объединяются и уникализируются.
 */
export async function getObjectCompanies(objectId: string): Promise<CompanyAggregated[]> {
  // эмуляция задержки сети
  await new Promise((r) => setTimeout(r, 300));

  const related = MOCK_OBJECT_CONTRACTS.filter((c) => c.objectId === objectId);
  const byInn: Record<string, CompanyAggregated> = {};

  related.forEach((contract) => {
    contract.participants.forEach((p) => {
      const key = p.company.inn;
      if (!byInn[key]) {
        byInn[key] = {
          name: p.company.name,
          inn: p.company.inn,
          kpp: p.company.kpp,
          address: p.company.address,
          roles: [p.role],
          contractNumbers: [contract.contractNumber]
        };
      } else {
        if (!byInn[key].roles.includes(p.role)) {
          byInn[key].roles.push(p.role);
        }
        if (!byInn[key].contractNumbers.includes(contract.contractNumber)) {
          byInn[key].contractNumbers.push(contract.contractNumber);
        }
      }
    });
  });

  return Object.values(byInn);
}

// ------------------ Хранилище связей объект → компании (и метаданные) ------------------

const PROJECT_COMPANIES: Record<string, CompanyAggregated[]> = {};
const PROJECT_META: Record<string, { name: string }> = {};
const PROJECT_EXTERNAL: Record<string, string> = {};
const PROJECT_EMPLOYEES: Record<string, EmployeeMinimal[]> = {};

export function setProjectCompanies(projectId: string, companies: CompanyAggregated[]) {
  PROJECT_COMPANIES[projectId] = companies;
}

export async function getProjectCompanies(projectId: string): Promise<CompanyAggregated[]> {
  await new Promise((r) => setTimeout(r, 100));
  return PROJECT_COMPANIES[projectId] || [];
}

export function setProjectMeta(projectId: string, name: string) {
  PROJECT_META[projectId] = { name };
}

export function getProjectMeta(projectId: string): { name: string } | undefined {
  return PROJECT_META[projectId];
}

export function listProjects(): Array<{ id: string; name: string }> {
  return Object.entries(PROJECT_META).map(([id, meta]) => ({ id, name: meta.name }));
}

export function setProjectExternalId(projectId: string, externalObjectId: string) {
  PROJECT_EXTERNAL[projectId] = externalObjectId;
}

export function getProjectExternalId(projectId: string): string | undefined {
  return PROJECT_EXTERNAL[projectId];
}

// Предзаполнение для дефолтных объектов системы (id: 1..6)
(() => {
  // Метаданные имен объектов по умолчанию
  const defaultProjects: Record<string, string> = {
    '1': 'ЖК «Северный парк»',
    '2': 'БЦ «Технологический»',
    '3': 'ТРК «Галерея»',
    '4': 'ЖК «Рассветный»',
    '5': 'Логистический центр',
    '6': 'Детский сад «Солнышко»'
  };

  Object.entries(defaultProjects).forEach(([pid, pname]) => {
    PROJECT_META[pid] = { name: pname };
  });

  // Компании по умолчанию для объектов (агрегированы по ИНН)
  PROJECT_COMPANIES['1'] = [
    {
      name: 'ООО «ТехЗаказ Девелопмент»', inn: '7701234567', kpp: '770101001', address: '125009, г. Москва, ул. Тверская, д. 1',
      roles: ['технический заказчик'], contractNumbers: ['ДП-2024-001']
    },
    {
      name: 'ООО «ПроектСтрой»', inn: '7812345678', kpp: '781201001', address: '191025, г. Санкт-Петербург, Невский пр., д. 10',
      roles: ['проектировщик'], contractNumbers: ['ДП-2024-001']
    }
  ];

  PROJECT_COMPANIES['2'] = [
    {
      name: 'ООО «Север Кэпитал»', inn: '7812001122', kpp: '781201002', address: '191186, г. Санкт-Петербург, Дворцовая наб., д. 2',
      roles: ['технический заказчик'], contractNumbers: ['ДП-2024-010']
    },
    {
      name: 'АО «АрхИнжиниринг»', inn: '5409876543', kpp: '540901001', address: '630099, г. Новосибирск, ул. Ленина, д. 25',
      roles: ['проектировщик'], contractNumbers: ['ДП-2024-010']
    }
  ];

  PROJECT_COMPANIES['3'] = [
    {
      name: 'ООО «Логистик Групп»', inn: '5001234500', kpp: '500101001', address: '142000, Московская обл., г. Домодедово, пр-т Ленина, д. 7',
      roles: ['технический заказчик'], contractNumbers: ['ДП-2023-077']
    },
    {
      name: 'АО «АрхИнжиниринг»', inn: '5409876543', kpp: '540901001', address: '630099, г. Новосибирск, ул. Ленина, д. 25',
      roles: ['проектировщик'], contractNumbers: ['ДП-2023-077']
    }
  ];

  // Привязка дефолтных объектов к внешним объектам (для обновления из ИД)
  PROJECT_EXTERNAL['1'] = 'ext-obj-1';
  PROJECT_EXTERNAL['2'] = 'ext-obj-2';
  PROJECT_EXTERNAL['3'] = 'ext-obj-3';

  PROJECT_COMPANIES['4'] = [
    {
      name: 'ООО «ГородСтрой»', inn: '7703001122', kpp: '770301001', address: '109012, г. Москва, ул. Никольская, д. 12',
      roles: ['технический заказчик'], contractNumbers: ['ДП-2024-045']
    },
    {
      name: 'ООО «ИнжПроект»', inn: '7722334455', kpp: '772201001', address: '115054, г. Москва, ул. Валовая, д. 6',
      roles: ['проектировщик'], contractNumbers: ['ДП-2024-045']
    }
  ];

  PROJECT_COMPANIES['5'] = [
    {
      name: 'ООО «ТрансЛог Девелопмент»', inn: '5034567890', kpp: '503401001', address: '142100, г. Подольск, ул. Кирова, д. 3',
      roles: ['технический заказчик'], contractNumbers: ['ДП-2024-072']
    },
    {
      name: 'ООО «ПромПроект»', inn: '7709988776', kpp: '770901002', address: '125047, г. Москва, ул. Лесная, д. 5',
      roles: ['проектировщик'], contractNumbers: ['ДП-2024-072']
    }
  ];

  PROJECT_COMPANIES['6'] = [
    {
      name: 'ГУП «СоцОбъекты»', inn: '7805003322', kpp: '780501001', address: '190000, г. Санкт-Петербург, Адмиралтейская наб., д. 1',
      roles: ['технический заказчик'], contractNumbers: ['ДП-2024-099']
    },
    {
      name: 'ООО «СоцПроект»', inn: '7811223344', kpp: '781101001', address: '191123, г. Санкт-Петербург, Литейный пр., д. 15',
      roles: ['проектировщик'], contractNumbers: ['ДП-2024-099']
    }
  ];
})();

// ------------------ Сотрудники по компаниям (мок-генерация) ------------------

export type ObjectRole = 'admin' | 'signatory' | 'reviewer' | 'observer';

export interface EmployeeMinimal {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  companyInn: string;
  companyName: string;
  isCompanyAdmin?: boolean;
}

export async function getEmployeesForCompanies(companies: CompanyAggregated[]): Promise<EmployeeMinimal[]> {
  await new Promise((r) => setTimeout(r, 150));
  const employees: EmployeeMinimal[] = [];

  const LAST_NAMES = [
    'Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Васильев', 'Новиков', 'Фёдоров', 'Орлов', 'Соколов',
    'Волков', 'Семенов', 'Егоров', 'Лебедев', 'Алексеев', 'Морозов', 'Николаев', 'Макаров'
  ];
  const FIRST_NAMES = [
    'Алексей', 'Иван', 'Пётр', 'Дмитрий', 'Михаил', 'Сергей', 'Андрей', 'Владимир', 'Елена', 'Анна',
    'Ольга', 'Мария', 'Наталья', 'Татьяна', 'Ирина', 'Юлия', 'Ксения', 'Виктор'
  ];
  const PATRONYMICS = [
    'Алексеевич', 'Иванович', 'Петрович', 'Дмитриевич', 'Михайлович', 'Сергеевич', 'Андреевич', 'Владимирович',
    'Алексеевна', 'Ивановна', 'Петровна', 'Дмитриевна', 'Михайловна', 'Сергеевна', 'Андреевна', 'Владимировна'
  ];

  const pickName = (seed: number) => {
    const ln = LAST_NAMES[seed % LAST_NAMES.length];
    const fn = FIRST_NAMES[seed % FIRST_NAMES.length];
    const pn = PATRONYMICS[seed % PATRONYMICS.length];
    return `${ln} ${fn} ${pn}`;
  };

  companies.forEach((c, idx) => {
    const baseId = c.inn;
    const seed = Number(baseId.slice(-3)) || idx;
    const fullName1 = pickName(seed);
    const fullName2 = pickName(seed + 7);

    employees.push(
      {
        id: `${baseId}-emp-1`,
        name: fullName1,
        position: c.roles.includes('проектировщик') ? 'Инженер-проектировщик' : 'Менеджер проекта',
        email: `emp1@${baseId}.example`,
        phone: '+7 (900) 000-00-01',
        companyInn: c.inn,
        companyName: c.name,
        isCompanyAdmin: true
      },
      {
        id: `${baseId}-emp-2`,
        name: fullName2,
        position: c.roles.includes('технический заказчик') ? 'Куратор от заказчика' : 'Инженер',
        email: `emp2@${baseId}.example`,
        phone: '+7 (900) 000-00-02',
        companyInn: c.inn,
        companyName: c.name,
        isCompanyAdmin: false
      }
    );
  });
  return employees;
}

export async function getProjectEmployees(projectId: string): Promise<EmployeeMinimal[]> {
  await new Promise((r) => setTimeout(r, 100));
  if (PROJECT_EMPLOYEES[projectId]) return PROJECT_EMPLOYEES[projectId];
  const companies = PROJECT_COMPANIES[projectId] || [];
  const employees = await getEmployeesForCompanies(companies);
  PROJECT_EMPLOYEES[projectId] = employees;
  return employees;
}

export function setProjectEmployees(projectId: string, employees: EmployeeMinimal[]) {
  PROJECT_EMPLOYEES[projectId] = employees;
}

export async function removeOrganizationFromProject(projectId: string, inn: string): Promise<void> {
  const companies = (PROJECT_COMPANIES[projectId] || []).filter((c) => c.inn !== inn);
  PROJECT_COMPANIES[projectId] = companies;
  // Пересчитаем сотрудников без удалённой организации
  const currentEmployees = PROJECT_EMPLOYEES[projectId] || (await getEmployeesForCompanies(companies));
  const nextEmployees = currentEmployees.filter((e) => e.companyInn !== inn);
  PROJECT_EMPLOYEES[projectId] = nextEmployees;
}

// ------------------ Структура папок объекта (мок) ------------------

export interface ObjectFolder {
  name: string;
  children?: ObjectFolder[];
}

const MOCK_OBJECT_FOLDERS: ObjectFolder[] = [
  { name: '01 - Общая информация' },
  { name: '02 - Объекты строительства', children: [
    { name: 'Очередь 1', children: [
      { name: '01 - Делопроизводство' },
      { name: '02 - ИРД' },
      { name: '03 - Концепция' },
      { name: '04 - ЧТУ, ТУ и Стандарты' },
      { name: '05 - Регламенты' },
      { name: '06 - Согласования' },
      { name: '07 - ПД (Проектная документация)' },
      { name: '08 - Экспертиза' }
    ]}
  ]},
  { name: '03 - Инженерные системы' }
];

export function getObjectFolderPaths(): string[] {
  const paths: string[] = [];
  const dfs = (node: ObjectFolder, prefix: string[]) => {
    const current = [...prefix, node.name];
    paths.push(current.join(' / '));
    if (node.children) node.children.forEach((child) => dfs(child, current));
  };
  MOCK_OBJECT_FOLDERS.forEach((root) => dfs(root, []));
  return paths;
}

// ------------------ Процессы согласования и доступы (мок) ------------------

export interface ProcessMeta {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'archived';
  isTemplate: boolean;
  steps: number;
}

const MOCK_PROCESSES: ProcessMeta[] = [
  { id: 'proc-1', name: 'Стандартное согласование ПД', status: 'active', isTemplate: true, steps: 2 },
  { id: 'proc-2', name: 'Быстрое согласование', status: 'active', isTemplate: true, steps: 1 },
  { id: 'proc-3', name: 'Расширенное согласование экспертизы', status: 'active', isTemplate: true, steps: 4 },
  { id: 'proc-4', name: 'Согласование для ЖК Северный парк', status: 'active', isTemplate: false, steps: 3 },
  { id: 'proc-5', name: 'Процесс согласования ИРД', status: 'draft', isTemplate: true, steps: 2 }
];

// Карта доступов: компания -> процессы, которые админ компании может запускать
const COMPANY_PROCESS_ACCESS: Record<string, string[]> = {
  // по ИНН/или имени компании; в нашей демо привяжем по имени из RoleContext
  'setlgroup': ['proc-4'],
  'ПроектСтрой': ['proc-4'],
  'СОД pirNew': ['proc-4']
};

export async function listAccessibleProcessesForCompany(company?: string): Promise<ProcessMeta[]> {
  await new Promise((r) => setTimeout(r, 80));
  const ids = company ? COMPANY_PROCESS_ACCESS[company] || [] : [];
  const byCompany = MOCK_PROCESSES.filter(p => ids.includes(p.id));
  // Разрешаем также все активные не шаблонные
  const globalActives = MOCK_PROCESSES.filter(p => p.status === 'active' && !p.isTemplate);
  const merged: Record<string, ProcessMeta> = {};
  [...byCompany, ...globalActives].forEach(p => merged[p.id] = p);
  return Object.values(merged);
}

// ------------------ Документы по объекту (мок) ------------------

export interface SimpleDocument {
  id: string;
  name: string;
}

const MOCK_PROJECT_DOCUMENTS: Record<string, SimpleDocument[]> = {
  '1': [
    { id: 'doc-1', name: 'Архитектурные решения - Планы этажей' },
    { id: 'doc-2', name: '02 - ИРД / Разрешения' },
    { id: 'doc-3', name: '07 - ПД / Общая пояснительная записка' }
  ],
  '2': [
    { id: 'doc-4', name: 'Конструктивные решения - Фундамент' },
    { id: 'doc-5', name: 'Электроснабжение - Схемы питания' }
  ],
  '3': [
    { id: 'doc-6', name: 'Заключение экспертизы' }
  ]
};

export async function getProjectDocuments(projectId: string): Promise<SimpleDocument[]> {
  await new Promise((r) => setTimeout(r, 120));
  if (MOCK_PROJECT_DOCUMENTS[projectId]) return MOCK_PROJECT_DOCUMENTS[projectId];
  const meta = PROJECT_META[projectId];
  // Сгенерируем несколько документов для внешних объектов
  return [
    { id: `${projectId}-doc-a`, name: `${meta?.name || 'Объект'} / Исходные данные` },
    { id: `${projectId}-doc-b`, name: `${meta?.name || 'Объект'} / Пояснительная записка` },
    { id: `${projectId}-doc-c`, name: `${meta?.name || 'Объект'} / Чертежи разделов` }
  ];
}

// ------------------ Исполнители по объекту (мок) ------------------

export interface AssigneeInfo {
  id: string;
  name: string;
  role: string; // например: Руководитель подразделения, Инженер и т.д.
  isRpp?: boolean; // РПП
}

const MOCK_PROJECT_ASSIGNEES: Record<string, AssigneeInfo[]> = {
  '1': [
    { id: 'rpp-1', name: 'Анна Смирнова', role: 'Руководитель подразделения', isRpp: true },
    { id: 'emp-1', name: 'Петр Иванов', role: 'Главный архитектор' },
    { id: 'emp-2', name: 'Михаил Козлов', role: 'Инженер ОВ' }
  ],
  '2': [
    { id: 'rpp-2', name: 'Дмитрий Петров', role: 'Руководитель подразделения', isRpp: true },
    { id: 'emp-3', name: 'Анна Сидорова', role: 'Инженер-конструктор' },
    { id: 'emp-4', name: 'Ольга Смирнова', role: 'Инженер-электрик' }
  ],
  '3': [
    { id: 'rpp-3', name: 'Елена Волкова', role: 'Руководитель подразделения', isRpp: true },
    { id: 'emp-5', name: 'Дмитрий Петров', role: 'Эксперт' }
  ]
};

export async function getProjectAssignees(projectId: string): Promise<AssigneeInfo[]> {
  await new Promise((r) => setTimeout(r, 100));
  const known = MOCK_PROJECT_ASSIGNEES[projectId];
  if (known) return known;
  const meta = PROJECT_META[projectId]?.name || 'Объект';
  return [
    { id: `${projectId}-rpp`, name: `${meta} — РПП`, role: 'Руководитель подразделения', isRpp: true },
    { id: `${projectId}-eng-a`, name: 'Инженер А', role: 'Инженер' },
    { id: `${projectId}-eng-b`, name: 'Инженер Б', role: 'Инженер' }
  ];
}

// ------------------ Документы и согласование (центральное хранилище) ------------------

export type DocumentStatus = 'draft' | 'on-approval' | 'approved' | 'rejected';

export interface DocRecord {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: string;
  size: string;
  version: string;
  author: string;
  uploadDate: string;
  status: DocumentStatus;
  processInfo?: { processName: string; currentStep: number; totalSteps: number };
}

const DOC_STORE: Record<string, DocRecord> = {
  'doc-1': { id: 'doc-1', projectId: '1', name: 'Архитектурные решения - Планы этажей', description: 'Архитектурные планы этажей жилого комплекса', type: 'PDF', size: '2.4 МБ', version: '1.2', author: 'Петр Иванов', uploadDate: '2024-01-15', status: 'on-approval', processInfo: { processName: 'Согласование для ЖК Северный парк', currentStep: 2, totalSteps: 3 } },
  'doc-2': { id: 'doc-2', projectId: '2', name: 'Конструктивные решения - Фундамент', type: 'DWG', size: '5.1 МБ', version: '2.0', author: 'Анна Сидорова', uploadDate: '2024-01-12', status: 'on-approval', processInfo: { processName: 'Процесс согласования ИРД', currentStep: 1, totalSteps: 2 } },
  'doc-3': { id: 'doc-3', projectId: '1', name: 'Система отопления - Схемы', type: 'PDF', size: '1.8 МБ', version: '1.0', author: 'Михаил Козлов', uploadDate: '2024-01-18', status: 'draft' }
};

export async function getDocument(docId: string): Promise<DocRecord | undefined> {
  await new Promise((r) => setTimeout(r, 80));
  return DOC_STORE[docId];
}

export async function listDocuments(): Promise<DocRecord[]> {
  await new Promise((r) => setTimeout(r, 80));
  return Object.values(DOC_STORE);
}

export async function listProjectDocumentsFull(projectId: string): Promise<DocRecord[]> {
  await new Promise((r) => setTimeout(r, 80));
  return Object.values(DOC_STORE).filter(d => d.projectId === projectId);
}

export async function startApproval(docIds: string[], process: { name: string; steps: number }) {
  await new Promise((r) => setTimeout(r, 50));
  docIds.forEach(id => {
    const d = DOC_STORE[id];
    if (!d) return;
    d.status = 'on-approval';
    d.processInfo = { processName: process.name, currentStep: 1, totalSteps: process.steps };
  });
}

export async function approveOrAdvance(docId: string): Promise<'approved' | 'advanced'> {
  await new Promise((r) => setTimeout(r, 50));
  const d = DOC_STORE[docId];
  if (!d || !d.processInfo) return 'advanced';
  const { currentStep, totalSteps } = d.processInfo;
  if (currentStep >= totalSteps) {
    d.status = 'approved';
    delete d.processInfo;
    return 'approved';
  }
  d.processInfo.currentStep += 1;
  return 'advanced';
}

// ------------------ Уведомления (простая очередь) ------------------

export interface NotificationItem {
  id: string;
  text: string;
  link?: string;
}

const NOTIFICATIONS: NotificationItem[] = [];

export function pushNotification(n: NotificationItem) { NOTIFICATIONS.unshift(n); }
export function listNotifications(): NotificationItem[] { return NOTIFICATIONS; }

// ------------------ Версии документов (мок) ------------------

export interface DocumentVersion {
  version: string; // v1.0, v1.1, ...
  uploadedAt: string;
  size: string;
  type: string;
  uploadedBy: string;
  fileUrl: string;
}

const DOC_VERSIONS: Record<string, DocumentVersion[]> = {
  'doc-1': [
    { version: 'v1.2', uploadedAt: '2024-01-20 10:15', size: '2.4 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' },
    { version: 'v1.1', uploadedAt: '2024-01-18 09:00', size: '2.3 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' },
    { version: 'v1.0', uploadedAt: '2024-01-15 12:00', size: '2.2 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' }
  ],
  'doc-2': [
    { version: 'v1.6', uploadedAt: '2024-01-20 10:15', size: '2.4 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' },
    { version: 'v1.5', uploadedAt: '2024-01-20 10:15', size: '2.4 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' },
    { version: 'v1.4', uploadedAt: '2024-01-20 10:15', size: '2.4 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' },
    { version: 'v1.3', uploadedAt: '2024-01-20 10:15', size: '2.4 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' },
    { version: 'v1.2', uploadedAt: '2024-01-20 10:15', size: '2.4 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' },
    { version: 'v1.1', uploadedAt: '2024-01-18 09:00', size: '2.3 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' },
    { version: 'v1.0', uploadedAt: '2024-01-15 12:00', size: '2.2 МБ', type: 'PDF', uploadedBy: 'Петр Иванов', fileUrl: '#' }
  ]
};

export async function listDocumentVersions(docId: string): Promise<DocumentVersion[]> {
  await new Promise((r) => setTimeout(r, 80));
  return DOC_VERSIONS[docId] || [];
}

export async function addDocumentVersion(docId: string, file: { name: string; size: string; type: string; uploadedBy: string }): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  const versions = DOC_VERSIONS[docId] || (DOC_VERSIONS[docId] = []);
  const last = versions[0]?.version || 'v1.0';
  const number = Number(last.replace(/v/, '')) + 0.1;
  const next = `v${number.toFixed(1)}`;
  versions.unshift({ version: next, uploadedAt: new Date().toISOString(), size: file.size, type: file.type, uploadedBy: file.uploadedBy, fileUrl: '#' });
  // синхронно обновим и метаданные документа
  const d = DOC_STORE[docId];
  if (d) { d.version = next; d.size = file.size; d.type = file.type; }
}
