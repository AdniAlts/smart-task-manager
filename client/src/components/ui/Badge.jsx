const priorityConfig = {
  // Snake case from API
  'do_first': {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    dot: 'bg-rose-500',
    label: 'Do First',
  },
  'schedule': {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
    label: 'Schedule',
  },
  'delegate': {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    dot: 'bg-blue-500',
    label: 'Delegate',
  },
  'eliminate': {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    dot: 'bg-gray-500',
    label: 'Eliminate',
  },
  // Display names (fallback)
  'Do First': {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    dot: 'bg-rose-500',
    label: 'Do First',
  },
  'Schedule': {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
    label: 'Schedule',
  },
  'Delegate': {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    dot: 'bg-blue-500',
    label: 'Delegate',
  },
  'Eliminate': {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    dot: 'bg-gray-500',
    label: 'Eliminate',
  },
};

export function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig['eliminate'];
  const displayLabel = config?.label || priority;
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
      ${config.bg} ${config.border} ${config.text} border
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
}

export function SubjectBadge({ subject }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                     bg-violet-500/10 border border-violet-500/30 text-violet-400">
      {subject}
    </span>
  );
}

export function StatusBadge({ isCompleted }) {
  return isCompleted ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                     bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
      Completed
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                     bg-slate-500/10 border border-slate-500/30 text-slate-400">
      Pending
    </span>
  );
}
