'use client';

import { useState } from 'react';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { fetchNotes } from '../../../../lib/api';
import type { FetchNotesResponse } from '../../../../lib/api';

import { SearchBox } from '../../../../components/SearchBox/SearchBox';
import { Pagination } from '../../../../components/Pagination/Pagination';
import { NoteList } from '../../../../components/NoteList/NoteList';
import Link from 'next/link';

import css from './page.module.css';

interface NotesProps {
  initialData: FetchNotesResponse;
  tag?: string;
}

export default function Notes({ initialData, tag }: NotesProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 12;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', currentPage, debouncedSearch, tag],
    queryFn: () => fetchNotes(currentPage, perPage, tag, debouncedSearch),
    initialData,
    placeholderData: initialData,
  });

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox
          value={search}
          onChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
        />

        {data?.totalPages && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>

      {!isLoading && !isError && Array.isArray(data?.notes) && data.notes.length > 0 && (
        <NoteList notes={data.notes} />
      )}

    </div>
  );
}
