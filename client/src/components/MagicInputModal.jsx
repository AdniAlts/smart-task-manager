import { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { X, Sparkles, Edit3, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MagicInputModal = ({ isOpen, onClose }) => {
  const { analyzeText, createTask } = useTask();
  const [activeTab, setActiveTab] = useState('ai');
  const [rawText, setRawText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    deadline: '',
    priority_level: 'Schedule',
    description: '',
  });

  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeText(rawText);
      setAiResult(result);
      setFormData({
        title: result.title || '',
        subject: result.subject || '',
        deadline: result.deadline || '',
        priority_level: result.priority_level || 'Schedule',
        description: result.description || '',
      });
      toast.success('Analysis complete! Review and confirm.');
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(formData);
      handleClose();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleClose = () => {
    setRawText('');
    setAiResult(null);
    setFormData({
      title: '',
      subject: '',
      deadline: '',
      priority_level: 'Schedule',
      description: '',
    });
    setActiveTab('ai');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 id="modal-title" className="text-lg font-semibold text-white">Add New Task</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'ai'
                ? 'text-violet-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Smart AI
            {activeTab === 'ai' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'manual'
                ? 'text-violet-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Manual
            {activeTab === 'manual' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-120px)]">
          {activeTab === 'ai' && !aiResult && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Paste your assignment, announcement, or any task-related text. AI will extract the details automatically.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="e.g., Quiz Kalkulus 2 besok jam 10 pagi, materi integral..."
                className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none transition-colors"
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze with AI
                  </>
                )}
              </button>
            </div>
          )}

          {(activeTab === 'ai' && aiResult) || activeTab === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  placeholder="e.g., Quiz Kalkulus 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                    Subject <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                    placeholder="e.g., Matematika"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                    Priority <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.priority_level}
                    onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Do First">Do First</option>
                    <option value="Schedule">Schedule</option>
                    <option value="Delegate">Delegate</option>
                    <option value="Eliminate">Eliminate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  Deadline <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-20 bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none transition-colors"
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {aiResult && (
                  <button
                    type="button"
                    onClick={() => setAiResult(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2.5 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  {aiResult ? 'Confirm & Save' : 'Create Task'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MagicInputModal;
