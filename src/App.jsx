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

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://e4902b89a1c9e5bcd733b2d9d50ed08e@o4509720395448320.ingest.us.sentry.io/4509720399773696",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "system",
      isNameRequired: true,
      isEmailRequired: true,
    })
  ]
});

const VITE_BASE_ROUTE = import.meta.env.VITE_BASE_ROUTE;

function App() {
  return (
    <GlobalProvider>
      <ChatProvider>
        <CurrentChatProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }} basename={VITE_BASE_ROUTE}>
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