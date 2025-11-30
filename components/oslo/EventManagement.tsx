'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Send, Plus, Calendar, Clock } from 'lucide-react';
import { useOsloTranslations } from '@/lib/i18n/oslo/use-oslo-translations';

interface AllianceEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'raid' | 'war' | 'donation' | 'meeting' | 'general' | 'other';
  start_time: string;
  end_time?: string;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_end_date?: string;
  created_by: string;
  created_at: string;
}

interface EventManagementProps {
  allianceId: string;
}

export function EventManagement({ allianceId }: EventManagementProps) {
  const { t } = useOsloTranslations();
  const [events, setEvents] = useState<AllianceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<AllianceEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'general' as const,
    start_time: '',
    end_time: '',
    is_recurring: false,
    recurrence_pattern: null as 'daily' | 'weekly' | 'monthly' | null,
    recurrence_end_date: '',
  });

  // Carica eventi
  useEffect(() => {
    loadEvents();
  }, [allianceId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/oslo/events?alliance_id=${allianceId}`);
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events || []);
      } else {
        console.error('Errore caricamento eventi:', data.error);
      }
    } catch (error) {
      console.error('Errore caricamento eventi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        alliance_id: allianceId,
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        recurrence_end_date: formData.recurrence_end_date
          ? new Date(formData.recurrence_end_date).toISOString()
          : null,
      };

      let response;
      if (editingEvent) {
        // Update
        response = await fetch(`/api/oslo/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        response = await fetch('/api/oslo/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.ok) {
        await loadEvents();
        resetForm();
        alert(editingEvent ? t('oslo.messages.eventUpdated') : t('oslo.messages.eventCreated'));
      } else {
        alert(`${t('oslo.common.error')}: ${data.error}`);
      }
    } catch (error) {
      console.error('Errore salvataggio evento:', error);
      alert(t('oslo.messages.saveError'));
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm(t('oslo.messages.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/oslo/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadEvents();
        alert(t('oslo.messages.eventDeleted'));
      } else {
        const data = await response.json();
        alert(`${t('oslo.common.error')}: ${data.error}`);
      }
    } catch (error) {
      console.error('Errore eliminazione evento:', error);
      alert(t('oslo.messages.deleteError'));
    }
  };

  const handleEdit = (event: AllianceEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_time: new Date(event.start_time).toISOString().slice(0, 16),
      end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
      is_recurring: event.is_recurring,
      recurrence_pattern: event.recurrence_pattern || null,
      recurrence_end_date: event.recurrence_end_date
        ? new Date(event.recurrence_end_date).toISOString().slice(0, 16)
        : '',
    });
    setShowForm(true);
  };

  const handlePushAll = async () => {
    const title = prompt(t('oslo.notifications.title'));
    if (!title) return;

    const message = prompt(t('oslo.notifications.message'));
    if (!message) return;

    try {
      setPushLoading(true);
      const response = await fetch('/api/oslo/notifications/push-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alliance_id: allianceId,
          title,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('oslo.notifications.sent', { count: data.sent }));
      } else {
        alert(`${t('oslo.common.error')}: ${data.error}`);
      }
    } catch (error) {
      console.error('Errore invio push:', error);
      alert(t('oslo.messages.sendError'));
    } finally {
      setPushLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'general',
      start_time: '',
      end_time: '',
      is_recurring: false,
      recurrence_pattern: null,
      recurrence_end_date: '',
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  if (loading) {
    return <div className="p-4">{t('oslo.messages.loadingEvents')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('oslo.events.title')}</h2>
          <p className="text-muted-foreground">{t('oslo.alliance.events')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePushAll} disabled={pushLoading} variant="outline">
            <Send className="w-4 h-4 mr-2" />
            {pushLoading ? t('oslo.notifications.sending') : t('oslo.notifications.pushAll')}
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('oslo.events.create')}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEvent ? t('oslo.events.edit') : t('oslo.events.create')}</CardTitle>
            <CardDescription>
              {editingEvent ? t('oslo.events.edit') : t('oslo.events.create')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">{t('oslo.events.name')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder={t('oslo.placeholders.eventName')}
                />
              </div>

              <div>
                <Label htmlFor="description">{t('oslo.events.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('oslo.placeholders.eventDescription')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_type">{t('oslo.events.type')}</Label>
                  <Select
                    id="event_type"
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value as any })}
                  >
                    <option value="raid">{t('oslo.events.types.raid')}</option>
                    <option value="war">{t('oslo.events.types.war')}</option>
                    <option value="donation">{t('oslo.events.types.donation')}</option>
                    <option value="meeting">{t('oslo.events.types.meeting')}</option>
                    <option value="general">{t('oslo.events.types.general')}</option>
                    <option value="other">{t('oslo.events.types.other')}</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start_time">{t('oslo.events.startTime')} *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="end_time">{t('oslo.events.endTime')}</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_recurring">{t('oslo.events.recurring')}</Label>
              </div>

              {formData.is_recurring && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recurrence_pattern">{t('oslo.events.recurrencePattern')}</Label>
                    <Select
                      id="recurrence_pattern"
                      value={formData.recurrence_pattern || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, recurrence_pattern: e.target.value || null })
                      }
                    >
                      <option value="">{t('oslo.events.recurrencePattern')}</option>
                      <option value="daily">{t('oslo.events.patterns.daily')}</option>
                      <option value="weekly">{t('oslo.events.patterns.weekly')}</option>
                      <option value="monthly">{t('oslo.events.patterns.monthly')}</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="recurrence_end_date">{t('oslo.events.recurrenceEnd')}</Label>
                    <Input
                      id="recurrence_end_date"
                      type="datetime-local"
                      value={formData.recurrence_end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, recurrence_end_date: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">{editingEvent ? t('oslo.common.save') : t('oslo.events.create')}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('oslo.common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('oslo.events.scheduled')}</h3>
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('oslo.events.noEvents')}
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {event.title}
                      <Badge variant="outline">{t(`oslo.events.types.${event.event_type}`)}</Badge>
                      {event.is_recurring && (
                        <Badge variant="secondary">{t('oslo.events.recurring')}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.start_time)}
                      </span>
                      {event.end_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(event.end_time)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {event.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

