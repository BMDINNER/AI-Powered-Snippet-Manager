import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnippets } from '../../hooks/useSnippets';
import { useAI } from '../../hooks/useAI';
import { Card } from '../ui/Card';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { AIChat } from './AIChat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faSave, faTimes, faMagic } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import type { Snippet } from '../../types';

interface SnippetFormProps {
  snippet?: Snippet;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' }
];

export const SnippetForm: React.FC<SnippetFormProps> = ({ snippet, onClose }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getSnippet, createSnippet, updateSnippet } = useSnippets();
  const { generateSnippet, optimizeCode, loading: aiLoading } = useAI();
  const [showAIChat, setShowAIChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSnippet, setLoadingSnippet] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: ''
  });

  useEffect(() => {
    if (id) {
      loadSnippet(id);
    } else if (snippet) {
      populateForm(snippet);
    }
  }, [id, snippet]);

  const loadSnippet = async (snippetId: string) => {
    setLoadingSnippet(true);
    try {
      const data = await getSnippet(snippetId);
      populateForm(data);
    } catch (error) {
      console.error('Failed to load snippet:', error);
      toast.error('Failed to load snippet');
      onClose();
    } finally {
      setLoadingSnippet(false);
    }
  };

  const populateForm = (snippetData: Snippet) => {
    setFormData({
      title: snippetData.title || '',
      description: snippetData.description || '',
      code: snippetData.code || '',
      language: snippetData.language || 'javascript',
      tags: snippetData.tags?.join(', ') || ''
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = {
        title: formData.title,
        description: formData.description || undefined,
        code: formData.code,
        language: formData.language,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      };

      if (id) {
        await updateSnippet(id, data);
        toast.success('Snippet updated successfully');
      } else if (snippet) {
        await updateSnippet(snippet.id, data);
        toast.success('Snippet updated successfully');
      } else {
        await createSnippet(data);
        toast.success('Snippet created successfully');
      }
      onClose();
      navigate('/snippets');
    } catch (error: any) {
      console.error('Failed to save snippet:', error);
      toast.error(error.message || 'Failed to save snippet');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.description) {
      toast.error('Please enter a description first');
      return;
    }

    try {
      toast.loading('Generating snippet...', { id: 'ai-generate' });
      
      const generated = await generateSnippet(formData.description, formData.language);
      
      
      if (!generated || !generated.code) {
        toast.error('AI returned empty code. Please try again with a different description.', { id: 'ai-generate' });
        return;
      }

      if (generated.code.length === 0) {
        toast.error('AI returned empty code. Please try again with a different description.', { id: 'ai-generate' });
        return;
      }
      
      setFormData({
        ...formData,
        title: generated.title || formData.title,
        code: generated.code,
        tags: Array.isArray(generated.tags) ? generated.tags.join(', ') : ''
      });
      
      toast.success('Snippet generated successfully', { id: 'ai-generate' });
    } catch (error: any) {
      console.error('AI generation failed:', error);
      toast.error(error.message || 'AI generation failed', { id: 'ai-generate' });
    }
  };

  const handleOptimizeWithAI = async () => {
  if (!formData.code) {
    toast.error('Please enter code first');
    return;
  }

  try {
    toast.loading('Optimizing code...', { id: 'ai-optimize' });
    
    const optimized = await optimizeCode(formData.code, formData.language);
    
    if (optimized && optimized.length > 0) {
      // The optimized code comes as raw code, wrap it with markdown for display
      const markdownCode = `\`\`\`${formData.language}\n${optimized}\n\`\`\``;
      setFormData({
        ...formData,
        code: markdownCode
      });
      toast.success('Code optimized successfully', { id: 'ai-optimize' });
    } else {
      toast.error('Optimization returned empty result', { id: 'ai-optimize' });
    }
  } catch (error: any) {
    console.error('AI optimization failed:', error);
    toast.error(error.message || 'AI optimization failed', { id: 'ai-optimize' });
  }
};

  const handleInsertCode = (code: string) => {
    setFormData({ ...formData, code });
    setShowAIChat(false);
    toast.success('Code inserted from AI chat');
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  if (loadingSnippet) {
    return (
      <Card className="max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p>Loading snippet...</p>
        </div>
      </Card>
    );
  }

  const isEditMode = !!id || !!snippet;

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Snippet' : 'Create New Snippet'}
            </h2>
            <Button type="button" variant="ghost" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </Button>
          </div>

          {!isEditMode && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faRobot} className="h-5 w-5 text-red-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Use AI to help you create better snippets. You can generate, optimize, or chat with the AI assistant.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      icon={faMagic}
                      onClick={handleGenerateWithAI}
                      loading={aiLoading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Generate from Description
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      icon={faRobot}
                      onClick={() => setShowAIChat(true)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Open AI Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditMode && formData.code && (
            <div className="mb-4 flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={faMagic}
                onClick={handleOptimizeWithAI}
                loading={aiLoading}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Optimize with AI
              </Button>
            </div>
          )}

          <Input
            label="Title"
            value={formData.title}
            onChange={handleChange('title')}
            required
          />

          <TextArea
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            rows={2}
          />

          <Select
            label="Language"
            value={formData.language}
            onChange={handleChange('language')}
            options={languageOptions}
            required
          />

          <TextArea
            label="Code"
            value={formData.code}
            onChange={handleChange('code')}
            required
            rows={12}
            className="font-mono bg-gray-900 text-gray-100 border-gray-700"
            placeholder={isEditMode ? "Loading code..." : "Generated code will appear here..."}
          />

          <Input
            label="Tags (comma-separated)"
            value={formData.tags}
            onChange={handleChange('tags')}
            placeholder="react, hooks, api, javascript"
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" icon={faSave} loading={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {isEditMode ? 'Update Snippet' : 'Save Snippet'}
            </Button>
          </div>
        </form>
      </Card>

      <Modal
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        title="AI Assistant"
        size="xl"
      >
        <AIChat onInsertCode={handleInsertCode} />
      </Modal>
    </>
  );
};