import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Chat from './chat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;