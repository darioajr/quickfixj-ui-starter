import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@patternfly/react-core/dist/styles/base.css';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import Configurations from './pages/Configurations';
import Messages from './pages/Messages';
import './App.css';

function App() {
  return (
    <Router basename="/ui">
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/configurations" element={<Configurations />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:sessionId" element={<Messages />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
