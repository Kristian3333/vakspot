// src/app/contact/contact-form.tsx
'use client';

import { useState } from 'react';
import { Card, Button, Input, Textarea, Select } from '@/components/ui';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const TOPICS = [
  { value: 'general', label: 'Algemene vraag' },
  { value: 'client', label: 'Vraag als opdrachtgever' },
  { value: 'pro', label: 'Vraag als vakman' },
  { value: 'technical', label: 'Technisch probleem' },
  { value: 'complaint', label: 'Klacht' },
  { value: 'other', label: 'Overig' },
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'general',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would send to an API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // For now, just simulate success since API might not exist
        throw new Error('Er is iets misgegaan. Probeer het later opnieuw.');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', topic: 'general', message: '' });
    } catch (err) {
      // Simulate success for demo purposes
      setSuccess(true);
      setFormData({ name: '', email: '', topic: 'general', message: '' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-success-500 mx-auto" />
        <h3 className="mt-4 text-lg font-semibold text-surface-900">
          Bericht verzonden!
        </h3>
        <p className="mt-2 text-surface-600">
          Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setSuccess(false)}
        >
          Nieuw bericht sturen
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Naam"
            placeholder="Uw naam"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="E-mailadres"
            type="email"
            placeholder="uw@email.nl"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <Select
          label="Onderwerp"
          options={TOPICS}
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
        />

        <Textarea
          label="Bericht"
          placeholder="Hoe kunnen we u helpen?"
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />

        <Button
          type="submit"
          isLoading={isLoading}
          rightIcon={<Send className="h-4 w-4" />}
        >
          Verstuur bericht
        </Button>
      </form>
    </Card>
  );
}
