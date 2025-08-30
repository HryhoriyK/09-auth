'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api/clientApi';
import type { FetchNotesProps } from '@/types/note';

import NoteList from '@/components/NoteList/NoteList';
import Pagination from '@/components/Pagination/Pagination';
import SearchBox from '@/components/SearchBox/SearchBox';

import css from './page.module.css';
import Link from 'next/link';

type Props = {
  initialData: FetchNotesProps;
  tag?: string;
};

const PER_PAGE = 12;

export default function NotesClient({ initialData, tag }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

   const { data } = useQuery<FetchNotesProps>({
    queryKey: ['notes', page, debouncedSearch, tag],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch || undefined,
        tag,
      }),
    placeholderData: keepPreviousData,
    initialData,
  });

   const totalPages = data?.totalPages ?? 1;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }} />
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        <Link href="/notes/action/create" className="btn">Create note</Link>
      </header>

      {data?.notes.length > 0 && <NoteList notes={data.notes} />}
    </div>
  );
}