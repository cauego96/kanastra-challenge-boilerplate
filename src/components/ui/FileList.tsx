import React, { useContext, useEffect, useState } from 'react';
import { FileContext } from '../../contexts/FileContext';
import api from '../../services/api';

const FileList: React.FC = () => {
  const { dispatch } = useContext(FileContext);
  const [page, setPage] = useState(1); // Página atual
  const [nextPage, setNextPage] = useState<number | null>(null); // Próxima página
  const [files, setFiles] = useState<any[]>([]); // Define files como um array vazio []

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get(`/files/?page=${page}`);        
        console.log("Response data:", response.data);
        setFiles(response.data.results || []);
        dispatch({ type: 'SET_FILES', payload: response.data });
        console.log(response.data.next);

        // Define a próxima página com base nas informações de paginação
        if (response.data.next) {
          const urlParams = new URLSearchParams(response.data.next.split('?')[1]);
          const nextPage = urlParams.get('page');
          console.log('Next page:', nextPage);
          setNextPage(nextPage !== null ? parseInt(nextPage, 10) : null);
        } else {
          setNextPage(null); // Não há próxima página
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchFiles();
  }, [page, dispatch]);

  const handleNextPage = () => {
    console.log('Next page clicked');
    if (nextPage) {
      setPage(nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-6">
      <h2>File List</h2>
      <ul className="list-disc">
      {files && files.map((file: any, index: number) => (
        <li key={index}>{file.name}</li>
      ))}
      </ul>
      <div className="flex flex-row mt-6">
        <button className="bg-gray-800 text-white rounded-l-md border-r border-gray-100 py-2 hover:bg-red-700 hover:text-white px-3 disabled:pointer-events-none" onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
        <button className="bg-gray-800 text-white rounded-r-md py-2 border-l border-gray-200 hover:bg-red-700 hover:text-white px-3 disabled:pointer-events-none" onClick={handleNextPage} disabled={!nextPage}>Next</button>
      </div>
    </div>
  );
};

export default FileList;