import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StartScreenLayout from './layouts/StartScreenLayout';
import StartScreen from './pages/StartScreen';
import Login from './pages/Login';
import SingUp from './pages/SingUp';
import Chat from './pages/Chat';
import MainLayout from './layouts/MainLayout';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import { GlobalProvider } from './contexts/Global';

function App() {
  return (
    <GlobalProvider>
      <Router>
        <Routes>

          <Route path="/" element={<StartScreenLayout />}>
            <Route index element={<StartScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="/singup" element={<SingUp />} />
          </Route>
          <Route path="/" element={<MainLayout />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          /> */}
        </Routes>
      </Router>
    </GlobalProvider>
  );
}

export default App;