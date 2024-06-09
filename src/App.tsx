import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate  } from 'react-router-dom';
import UploadForm from './components/ui/UploadForm';
import FileList from './components/ui/FileList';
import { FileProvider } from './contexts/FileContext';

const App: React.FC = () => {
  return (
    <FileProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/upload" />} />
          <Route path="/upload" element={<UploadForm />} />
          <Route path="/files" element={<FileList />} />
        </Routes>
      </Router>
    </FileProvider>
  );
};

export default App;