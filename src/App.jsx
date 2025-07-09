import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import MainLayout from './layouts/MainLayout';
import { GlobalProvider } from './contexts/Global';
import { ChatProvider } from './contexts/Chat';
import { CurrentChatProvider } from './contexts/CurrentChat';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import StartScreen from './pages/StartScreen';
import Login from './pages/Login';
import SingUp from './pages/SingUp';
import StartScreenLayout from './layouts/StartScreenLayout';
import BasicLayout from './layouts/BasicLayout';
const VITE_BASE_ROUTE = import.meta.env.VITE_BASE_ROUTE;

function App() {
  return (
    <GlobalProvider>
      <ChatProvider>
        <CurrentChatProvider>
          <Router basename={VITE_BASE_ROUTE}>
            <Routes>
              <Route path="/" element={<StartScreenLayout />}>
                <Route index element={<StartScreen />} />
                <Route path="/login" element={<Login />} />
                <Route path="/singup" element={<SingUp />} />
              </Route>
              <Route path="/" element={<MainLayout />}>
                <Route path="/chat" element={<Chat />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="/" element={<BasicLayout />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </CurrentChatProvider>
      </ChatProvider>
    </GlobalProvider>
  );
}

export default App;