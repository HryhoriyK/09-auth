'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import css from './NoteForm.module.css';

import { createNote } from '@/lib/api/clientApi';
import { useNoteDraftStore } from '@/lib/store/noteStore';

type FormValues = {
  title: string;
  content: string;
  tag: string;
};

export default function NoteForm() {
  const idPrefix = useId();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { draft, setDraft, clearDraft } = useNoteDraftStore();

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [isValid, setIsValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      router.push('/notes/filter/All');
    },
    onError: () => {
      console.error('Failed to create note. Try again.');
    },
  });

  const validateField = (name: keyof FormValues, value: string) => {
    let errorMessage = '';
    switch (name) {
      case 'title':
        if (value.length < 3) {
          errorMessage = 'Please enter at least 3 characters';
        } else if (value.length > 50) {
          errorMessage = 'Maximum 50 characters';
        } else if (!value) {
          errorMessage = "Title can't be empty";
        }
        break;
      case 'content':
        if (value.length > 500) {
          errorMessage = 'Maximum 500 characters';
        }
        break;
      case 'tag':
        const validTags = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];
        if (!validTags.includes(value)) {
          errorMessage = 'Invalid tag';
        } else if (!value) {
          errorMessage = 'Tag is required';
        }
        break;
      default:
        break;
    }
    return errorMessage;
  };

  const validateForm = (values: FormValues) => {
    const newErrors: Partial<Record<keyof FormValues, string>> = {};
    let formIsValid = true;

    for (const key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        const name = key as keyof FormValues;
        const value = values[name];
        const error = validateField(name, value);
        if (error) {
          newErrors[name] = error;
          formIsValid = false;
        }
      }
    }
    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newDraft = { ...draft, [name]: value };
    setDraft(newDraft);

    const error = validateField(name as keyof FormValues, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    const fullValid = validateForm(newDraft as FormValues);
    setIsValid(fullValid);
  };

  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true);
    const values = Object.fromEntries(formData) as FormValues;

    if (validateForm(values)) {
      mutation.mutate({
        title: values.title,
        content: values.content ?? '',
        tag: values.tag,
      });
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    router.push('/notes/filter/All');
  };

  return (
    <form className={css.form} action={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor={`${idPrefix}-title`}>Title</label>
        <input
          id={`${idPrefix}-title`}
          name="title"
          className={css.input}
          defaultValue={draft.title}
          onChange={handleChange}
        />
        {errors.title && <span className={css.error}>{errors.title}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor={`${idPrefix}-content`}>Content</label>
        <textarea
          id={`${idPrefix}-content`}
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={draft.content}
          onChange={handleChange}
        />
        {errors.content && <span className={css.error}>{errors.content}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor={`${idPrefix}-tag`}>Tag</label>
        <select
          id={`${idPrefix}-tag`}
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={handleChange}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
        {errors.tag && <span className={css.error}>{errors.tag}</span>}
      </div>

      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={handleCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={!isValid || isSubmitting}
        >
          Create note
        </button>
      </div>
    </form>
  );
}