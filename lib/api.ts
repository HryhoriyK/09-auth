import axios from 'axios';
import type { Note } from '../types/note';

axios.defaults.baseURL = 'https://notehub-public.goit.study/api';
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN}`;


export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  currentPage: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: string;
}

export interface CreateNoteResponse {
  note: Note;
}

export interface DeleteNoteResponse {
  note: Note;
}

export const fetchNotes = async (
  page: number,
  perPage: number,
  tag?: string,
  search?: string
): Promise<FetchNotesResponse> => {
  const params = {
    page,
    perPage,
    ...(tag ? { tag } : {}),
    ...(search ? { search } : {}),
  };

  const res = await axios.get<FetchNotesResponse>('/notes', { params });
  return res.data;
};

export const getNotes = async (
  page: number,
  perPage: number,
  search?: string
): Promise<FetchNotesResponse> => {
  return fetchNotes(page, perPage, search);
};

export const createNote = async (
  noteData: CreateNoteParams
)=> {
  const { data } = await axios.post<CreateNoteResponse>('/notes', noteData);
  return data;
};

export const deleteNote = async (id: string): Promise<DeleteNoteResponse> => {
  const { data } = await axios.delete<DeleteNoteResponse>(`/notes/${id}`);
  return data;
};

export const fetchNoteById = async (id: string) => {
  const res = await axios.get<Note>(`/notes/${id}`);
  return res.data;
};

export type Tag = {
  id: string;
  name: string;
}

export const getTags = async (): Promise<Tag[]> => {
  try {
    const res = await axios.get<FetchNotesResponse>('/notes');
    const allNotes = res.data.notes;

    const uniqueTagNames = [...new Set(allNotes.map(note => note.tag))];

    const tags = uniqueTagNames.map(tagName => ({
        id: tagName,
        name: tagName
    }));

    return tags;
  } catch (error) {
    console.error("getTags error:", error);
    return [];
  }
};
