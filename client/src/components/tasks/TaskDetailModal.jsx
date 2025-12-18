import { useState, useEffect } from 'react';
import { X, Clock, BookOpen, AlertTriangle, Save, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { PriorityBadge, SubjectBadge } from '../ui/Badge';
import { useTask } from '../../context/TaskContext';

export default function TaskDetailModal({ task, isOpen, onClose }) {
  const { updateTask, deleteTask } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    deadline: '',
    priority_level: 'schedule',
    description: '',
  });

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        subject: task.subject || '',
        deadline: task.deadline ? formatDateForInput(task.deadline) : '',
        priority_level: task.priority_level || 'schedule',
        description: task.description || '',
      });
    }
  }, [task]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      await updateTask(task.id, {
        title: formData.title,
        subject: formData.subject,
        deadline: formData.deadline || null,
        priority_level: formData.priority_level,
        description: formData.description,
      });
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
        onClose();
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Edit Task" : "Task Details"} size="lg">
      {isEditing ? (
        // Edit Mode
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="Task title"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg
                       text-white placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Subject & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleFormChange('subject', e.target.value)}
                placeholder="e.g., Mathematics"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg
                         text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority_level}
                onChange={(e) => handleFormChange('priority_level', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg
                         text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="do_first">Do First (Urgent)</option>
                <option value="schedule">Schedule</option>
                <option value="delegate">Delegate</option>
                <option value="eliminate">Eliminate (Low)</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => handleFormChange('deadline', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Add more details..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg
                       text-white placeholder-slate-500 resize-none
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsEditing(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!formData.title.trim()}
              className="flex-1"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="space-y-6">
          {/* Title & Status */}
          <div>
            <h3 className={`text-xl font-semibold text-white mb-2 ${task.is_completed ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority_level} />
              {task.subject && <SubjectBadge subject={task.subject} />}
              {task.is_completed && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                               bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
            <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Deadline</p>
              <p className="text-white font-medium">{formatDisplayDate(task.deadline)}</p>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Meta Info */}
          <div className="pt-4 border-t border-slate-700/50 text-xs text-slate-500">
            <p>Created: {new Date(task.created_at || Date.now()).toLocaleDateString()}</p>
            {task.updated_at && (
              <p>Last updated: {new Date(task.updated_at).toLocaleDateString()}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex-1"
            >
              Edit Task
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
