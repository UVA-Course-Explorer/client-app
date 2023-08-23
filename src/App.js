// import logo from './logo.svg';
import './App.css';
import SearchComponent from './SearchComponent';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p style={{fontFamily:'Courier', fontSize:'60px'}}>UVA Course Explorer</p>
        <SearchComponent />
      </header>
    </div>
  );
}

export default App;
