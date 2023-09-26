import React from "react";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import PageTemplate from './PageTemplate';
import './modalStyles.css'
import './App.css';



function App() {


// loop over the data and create a list of links
return (
  <Router>
    <Routes>
    <Route path="/catalog/department/:department" element={<PageTemplate target={"catalog-page"}/>} />
    <Route path="/search" element={<PageTemplate target={"search"}/>} />
    <Route path="/catalog" element={<PageTemplate target={"catalog"}/>} />

    <Route path="/" element={<PageTemplate target={"search"}/>} />

    </Routes>
  </Router>
)

}

export default App;
