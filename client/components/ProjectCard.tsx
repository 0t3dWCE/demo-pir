import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, Calendar, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'in-progress' | 'on-approval' | 'approved' | 'rejected';
  progress: number;
  location: string;
  deadline: string;
  documentsCount: number;
  teamSize: number;
}

// Мини-сводка по документам в карточке объекта (демо-значения)
const miniSummaryDefaults = {
  approved: 15,
  onApproval: 3,
  draft: 12,
  rejected: 1,
};

function parseDeadline(input: string): Date | undefined {
  if (!input || input === '—') return undefined;
  // Ожидаемый формат dd.mm.yyyy
  const parts = input.split('.');
  if (parts.length !== 3) return undefined;
  const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
  if (!yyyy || !mm || !dd) return undefined;
  return new Date(yyyy, mm - 1, dd);
}

function getStatusLabelAndColor(project: Project): { label: string; colorClass: string } {
  if (project.status === 'approved') {
    return { label: 'Завершен', colorClass: 'text-green-600' };
  }

  const deadlineDate = parseDeadline(project.deadline);
  const now = new Date();
  const isOverdue = Boolean(deadlineDate && deadlineDate < now && project.progress < 100);

  if (isOverdue) {
    return { label: 'В работе — просрочен', colorClass: 'text-amber-600' };
  }
  return { label: 'В работе', colorClass: 'text-blue-600' };
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const summary = miniSummaryDefaults;
  const statusUi = getStatusLabelAndColor(project);

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {project.name}
              <span className={`ml-2 text-sm font-normal ${statusUi.colorClass}`}>{statusUi.label}</span>
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600 line-clamp-3">
            {project.description}
          </p>
          {/* Мини-сводка по документам */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center text-xs text-gray-700">
              <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
              Согласовано: <span className="ml-1 font-medium">{summary.approved}</span>
            </div>
            <div className="flex items-center text-xs text-gray-700">
              <span className="w-2 h-2 rounded-full bg-yellow-600 mr-2"></span>
              На согласовании: <span className="ml-1 font-medium">{summary.onApproval}</span>
            </div>
            <div className="flex items-center text-xs text-gray-700">
              <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
              Черновик: <span className="ml-1 font-medium">{summary.draft}</span>
            </div>
            <div className="flex items-center text-xs text-gray-700">
              <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
              Отклонено: <span className="ml-1 font-medium">{summary.rejected}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Прогресс</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>

          {/* Deadline */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 shrink-0" />
            <span>До {project.deadline}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-1" />
              <span>{project.documentsCount} док.</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span>{project.teamSize} чел.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
