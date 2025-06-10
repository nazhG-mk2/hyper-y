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
import ChatBasic from './pages/ChatBasic';

function App() {
  return (
    <GlobalProvider>
      <ChatProvider>
        <CurrentChatProvider>
          <Router basename="/hyperY/">
            <Routes>
              <Route path="/" element={<StartScreenLayout />}>
                <Route index element={<StartScreen />} />
                <Route path="/login" element={<Login />} />
                <Route path="/singup" element={<SingUp />} />
              </Route>
              <Route path="/" element={<MainLayout />}>
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat-basic" element={<ChatBasic />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Routes>
          </Router>
        </CurrentChatProvider>
      </ChatProvider>
    </GlobalProvider>
  );
}

export default App;