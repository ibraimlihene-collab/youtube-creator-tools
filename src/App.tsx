import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ThumbnailDesigner from './features/thumbnail-designer/ThumbnailDesigner';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<ThumbnailDesigner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
