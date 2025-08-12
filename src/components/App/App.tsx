import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';

import toast, { Toaster } from 'react-hot-toast';
import css from './App.module.css';

import NoteList from '../NoteList/NoteList';
import { fetchNotes } from '../../services/noteService';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Loader from '../Loader/Loader';
import Pagination from '../Pagination/Pagination';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import SearchBox from '../SearchBox/SearchBox';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const saveDebouncedQuery = useDebouncedCallback((query: string) => {
    setDebouncedQuery(query);
  }, 300);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    saveDebouncedQuery(event.target.value);
    setCurrentPage(1);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['notes', debouncedQuery, currentPage],
    queryFn: () => fetchNotes(debouncedQuery, currentPage),
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.totalPages ?? 0;

  useEffect(() => {
    if (isSuccess && data?.notes.length === 0) {
      toast.error('No notes found for your request.');
    }
  }, [isSuccess, data]);

  return (
    <>
      <div className={css.app}>
        <header className={css.toolbar}>
          {<SearchBox searchQuery={query} onChange={handleChange} />}
          {isSuccess && totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
          {
            <button className={css.button} onClick={openModal}>
              Create note +
            </button>
          }
        </header>
        {isModalOpen && (
          <Modal onClose={closeModal}>
            <NoteForm onClose={closeModal} />
          </Modal>
        )}
        {isError ? (
          <ErrorMessage />
        ) : (
          data && data.notes.length > 0 && <NoteList notes={data.notes} />
        )}
        {isLoading && <Loader />}
      </div>
      <Toaster />
    </>
  );
}
