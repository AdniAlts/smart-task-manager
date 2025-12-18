import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useTask } from '../../context/TaskContext';
import toast from 'react-hot-toast';

export default function EditTaskModal({ task, isOpen, onClose }) {
  const { updateTask } = useTask();
  const [isSaving, setIsSaving] = useState(false);
  
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateTask(task.id, {
        title: formData.title,
        subject: formData.subject,
        deadline: formData.deadline || null,
        priority_level: formData.priority_level,
        description: formData.description,
      });
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task" size="lg">
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
            onClick={onClose}
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
    </Modal>
  );
}
