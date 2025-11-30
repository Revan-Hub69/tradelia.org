'use client';

import { useState, useEffect } from 'react';
import { Share2, Twitter, Linkedin, MessageSquare, Plus, Edit2, Trash2, Send, Settings, Sparkles } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'linkedin' | 'reddit' | 'quora';
  content: string;
  link?: string;
  autoPost: boolean;
  aiGenerated: boolean;
  scheduledAt?: string;
  postedAt?: string;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
}

interface SocialConfig {
  platform: 'twitter' | 'linkedin' | 'reddit' | 'quora';
  enabled: boolean;
  apiKey?: string;
  autoPostOnReport: boolean;
}

const platforms = [
  { id: 'twitter' as const, name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
  { id: 'linkedin' as const, name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  { id: 'reddit' as const, name: 'Reddit', icon: MessageSquare, color: 'text-orange-500' },
  { id: 'quora' as const, name: 'Quora', icon: MessageSquare, color: 'text-red-500' },
];

export function SocialMediaManagement() {
  const { t } = useTranslations();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [configs, setConfigs] = useState<SocialConfig[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialConfig['platform'] | null>(null);
  const [newPost, setNewPost] = useState({
    platform: 'twitter' as SocialConfig['platform'],
    content: '',
    link: '',
    autoPost: false,
  });

  useEffect(() => {
    fetchPosts();
    fetchConfigs();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/social/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/social/config');
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const generateAICopy = async (reportTitle: string, reportLink: string) => {
    try {
      const response = await fetch('/api/admin/social/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportTitle, reportLink, platform: newPost.platform }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewPost({ ...newPost, content: data.copy });
      }
    } catch (error) {
      console.error('Error generating AI copy:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content) return;

    try {
      const response = await fetch('/api/admin/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        await fetchPosts();
        setIsCreating(false);
        setNewPost({ platform: 'twitter', content: '', link: '', autoPost: false });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handlePostNow = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/social/posts/${postId}/post`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error posting:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm(t('admin.social.confirmDelete') || 'Eliminare questo post?')) return;

    try {
      const response = await fetch(`/api/admin/social/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const togglePlatform = (platform: SocialConfig['platform']) => {
    setConfigs(configs.map(c => 
      c.platform === platform ? { ...c, enabled: !c.enabled } : c
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {t('admin.social.title') || 'Social Media Auto-Posting'}
            </h2>
            <p className="text-sm text-text-tertiary">
              {t('admin.social.subtitle') || 'Gestisci post automatici sui social con AI'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConfiguring(true)}
            className="px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary font-medium flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            {t('admin.social.config') || 'Configura'}
          </button>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('admin.social.create') || 'Crea Post'}
          </button>
        </div>
      </div>

      {/* Platform Config */}
      <AnimatePresence>
        {isConfiguring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bg-soft border border-border-subtle rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-text-primary">
              {t('admin.social.platformConfig') || 'Configurazione Piattaforme'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {platforms.map((platform) => {
                const config = configs.find(c => c.platform === platform.id) || {
                  platform: platform.id,
                  enabled: false,
                  autoPostOnReport: false,
                };
                const Icon = platform.icon;
                return (
                  <div
                    key={platform.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      config.enabled
                        ? 'border-accent/40 bg-accent/5'
                        : 'border-border-subtle bg-bg-surface'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('w-5 h-5', platform.color)} />
                        <span className="font-medium text-text-primary">{platform.name}</span>
                      </div>
                      <button
                        onClick={() => togglePlatform(platform.id)}
                        className={cn(
                          'w-10 h-6 rounded-full transition-colors relative',
                          config.enabled ? 'bg-accent' : 'bg-bg-soft border border-border-subtle'
                        )}
                      >
                        <span className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                          config.enabled ? 'translate-x-4' : 'translate-x-0'
                        )} />
                      </button>
                    </div>
                    {config.enabled && (
                      <div className="space-y-2 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.autoPostOnReport}
                            onChange={(e) => {
                              setConfigs(configs.map(c =>
                                c.platform === platform.id
                                  ? { ...c, autoPostOnReport: e.target.checked }
                                  : c
                              ));
                            }}
                            className="w-4 h-4 rounded border-border-subtle text-accent"
                          />
                          <span className="text-text-secondary">
                            {t('admin.social.autoPostOnReport') || 'Post automatico ad ogni report'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setIsConfiguring(false)}
              className="w-full px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
            >
              {t('admin.social.save') || 'Salva Configurazione'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bg-soft border border-border-subtle rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-text-primary">
              {t('admin.social.newPost') || 'Nuovo Post'}
            </h3>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('admin.social.platform') || 'Piattaforma'}
              </label>
              <select
                value={newPost.platform}
                onChange={(e) => setNewPost({ ...newPost, platform: e.target.value as SocialConfig['platform'] })}
                className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('admin.social.link') || 'Link (opzionale)'}
              </label>
              <input
                type="url"
                value={newPost.link}
                onChange={(e) => setNewPost({ ...newPost, link: e.target.value })}
                className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="https://..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-text-tertiary">
                  {t('admin.social.content') || 'Contenuto'}
                </label>
                <button
                  onClick={() => generateAICopy('Nuovo Report', newPost.link || '')}
                  className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {t('admin.social.generateAI') || 'Genera con AI'}
                </button>
              </div>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent min-h-[120px]"
                placeholder={t('admin.social.contentPlaceholder') || 'Scrivi il contenuto del post...'}
              />
              <p className="text-xs text-text-tertiary mt-1">
                {newPost.content.length} / {newPost.platform === 'twitter' ? 280 : 3000} caratteri
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreatePost}
                className="flex-1 rounded-lg bg-accent hover:bg-accent-hover text-white py-2 px-4 font-medium transition-colors"
              >
                {t('admin.social.create') || 'Crea'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewPost({ platform: 'twitter', content: '', link: '', autoPost: false });
                }}
                className="px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('admin.social.cancel') || 'Annulla'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            <Share2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('admin.social.empty') || 'Nessun post creato'}</p>
          </div>
        ) : (
          posts.map((post) => {
            const platform = platforms.find(p => p.id === post.platform);
            const Icon = platform?.icon || Share2;
            return (
              <div
                key={post.id}
                className="bg-bg-soft border border-border-subtle rounded-xl p-4 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('w-4 h-4', platform?.color)} />
                      <span className="font-medium text-text-primary">{platform?.name}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs',
                        post.status === 'posted' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                        post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                        post.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        'bg-bg-surface text-text-tertiary border border-border-subtle'
                      )}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{post.content}</p>
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
                        {post.link}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {post.status === 'draft' && (
                      <button
                        onClick={() => handlePostNow(post.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
                        title={t('admin.social.postNow') || 'Posta ora'}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

