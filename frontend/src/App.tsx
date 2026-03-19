// ── Main App Component ──────────────────────────────────────────
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import CarDetail from './pages/CarDetail';
import Recommend from './pages/Recommend';
import Compare from './pages/Compare';
import Profile from './pages/Profile';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Content>
        <Footer />
      </Layout>
    </Router>
  );
}

export default App;
