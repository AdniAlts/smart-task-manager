import { useState } from 'react';
import { Sparkles, PenLine, Loader2, Wand2, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useTask } from '../../context/TaskContext';

export default function MagicInputModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ai');
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Manual form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    deadline: '',
    priority_level: 'Schedule',
    description: '',
  });

  const { analyzeTask, createTask } = useTask();

  const resetState = () => {
    setRawText('');
    setAnalyzedData(null);
    setFormData({
      title: '',
      subject: '',
      deadline: '',
      priority_level: 'Schedule',
      description: '',
    });
    setIsAnalyzing(false);
    setIsSaving(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeTask(rawText);
      setAnalyzedData(result);
      // Pre-fill form with analyzed data
      setFormData({
        title: result.title || '',
        subject: result.subject || '',
        deadline: result.deadline ? formatDateForInput(result.deadline) : '',
        priority_level: result.priority_level || 'Schedule',
        description: result.description || '',
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  };

  const handleSave = async () => {
    const dataToSave = activeTab === 'ai' && analyzedData ? formData : formData;
    
    if (!dataToSave.title.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await createTask({
        title: dataToSave.title,
        subject: dataToSave.subject,
        deadline: dataToSave.deadline || null,
        priority_level: dataToSave.priority_level,
        description: dataToSave.description,
      });
      handleClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task" size="lg">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800 rounded-lg mb-6">
        <button
          onClick={() => { setActiveTab('ai'); setAnalyzedData(null); }}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md
            font-medium text-sm transition-all duration-200
            ${activeTab === 'ai' 
              ? 'bg-violet-600 text-white' 
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          Smart AI
        </button>
        <button
          onClick={() => { setActiveTab('manual'); setAnalyzedData(null); }}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md
            font-medium text-sm transition-all duration-200
            ${activeTab === 'manual' 
              ? 'bg-violet-600 text-white' 
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          <PenLine className="w-4 h-4" />
          Manual
        </button>
      </div>

      {/* AI Tab Content */}
      {activeTab === 'ai' && !analyzedData && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-violet-600/10 to-purple-600/10 
                          border border-violet-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h4 className="font-medium text-violet-300 mb-1">AI Magic Mode</h4>
                <p className="text-sm text-slate-400">
                  Just describe your task naturally. For example: "Math homework chapter 5 due Friday 10pm"
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Describe your task
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g., Complete physics lab report about quantum mechanics, due next Monday at 9am, high priority"
              className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl
                       text-white placeholder-slate-500 resize-none
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <Button 
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={!rawText.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>Analyzing with AI...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* AI Result / Form */}
      {(activeTab === 'ai' && analyzedData) || activeTab === 'manual' ? (
        <div className="space-y-4">
          {activeTab === 'ai' && analyzedData && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">AI has analyzed your task. Review and edit if needed.</span>
            </div>
          )}

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
                <option value="Do First">Do First (Urgent)</option>
                <option value="Schedule">Schedule</option>
                <option value="Delegate">Delegate</option>
                <option value="Eliminate">Eliminate (Low)</option>
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
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg
                       text-white placeholder-slate-500 resize-none
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {activeTab === 'ai' && analyzedData && (
              <Button 
                variant="ghost" 
                onClick={() => setAnalyzedData(null)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button 
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!formData.title.trim()}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Confirm & Save'}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
