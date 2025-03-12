import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from './pages/Index';
import Home from './pages/home';
import T1Pageconfig from './pages/t1pageconfig';
import Page from './pages/page';

function App(){

  return (

    <Router>
      <Routes>
        <Route path="/" element={<Index/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/t1pageconfig/:nome" element={<T1Pageconfig/>} />
        <Route path="/page/:nome" element={<Page/>} />
      </Routes>
    </Router>

  );

}

export default App;
