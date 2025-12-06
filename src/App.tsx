import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Demo } from './pages/Demo';
import { Admin } from './pages/Admin';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Demo />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
