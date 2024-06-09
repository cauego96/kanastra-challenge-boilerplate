import React, { useContext, useState } from 'react'; 
import { FileContext } from '../../contexts/FileContext';
import api, { handleAxiosError } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';

const UploadForm: React.FC = () => {
  const { dispatch } = useContext(FileContext);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFileInChunks = async (file: File) => {
    const zip = new JSZip();
    zip.file(file.name, file);
    const zipContent = await zip.generateAsync({ type: 'blob' });

    const chunkSize = 1024 * 1024; 
    const totalChunks = Math.ceil(zipContent.size / chunkSize);
    console.log('zipContent ',zipContent.size);
    console.log('chunkSize ',chunkSize);
    console.log('totalChunks ',totalChunks);

    setLoading(true);
    setError(null);

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = zipContent.slice(i * chunkSize, (i + 1) * chunkSize);
        const formData = new FormData();
        formData.append('file', chunk, `${file.name}.part${i}`);

        //console.log(formData);
        await api.post('/upload/', formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(Math.round(((i + 1) / totalChunks) * progress));
            }
          },
        });
      }
    } catch (error) {
      throw handleAxiosError(error);
    } finally {
      setLoading(false);
    }
    return totalChunks;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      const totalChunks = await uploadFileInChunks(file);
      console.log('totalChunks=',totalChunks);
      console.log('fileName=',`${file.name}.part${Number(totalChunks) - 1}`);

      const formData = new FormData();
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', `${file.name}.part${totalChunks - 1}`);

      await api.post('/upload/complete/', formData);
      dispatch({ type: 'ADD_FILE', payload: { name: file.name } }); 
      setError(null);
      setUploadProgress(0);
      navigate('/files'); 
    } catch (error: any) {
      setError(error.message);
      console.error('Error uploading file:', error);
      setUploadProgress(0); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8">
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" type="file" onChange={handleFileChange} />
          <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="submit" disabled={loading}>Upload</button>
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full mt-2">
              <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${uploadProgress}%` }}>
                {uploadProgress === 100 ? "Adicionando ao banco de dados" : `${uploadProgress}%`}
              </div>
            </div>
          )}
          {error && <p className="text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default UploadForm;