import SearchComponent from './SearchComponent';
import React, { useState} from "react";
import Modal from 'react-modal';
import './modalStyles.css'
import './App.css';



function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);


  Modal.setAppElement('#root');

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const GitHubIcon = () => {
    return (
        <div className="github-icon">
            <a href="https://github.com/UVA-Course-Explorer" target="_blank" rel="noopener noreferrer">
                <img src="github-mark-white.png" alt="GitHub" />
            </a>
        </div>        
    );
};

  return (

    <div className="App">
      <header className="App-header">
      <button onClick={openModal} className="fixed-button">ⓘ</button>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        className = "modal">

      <div className='scroll-div'>
        <h2 className="modal-content">UVA Course Explorer Info</h2>
        <p className="modal-content">
          This is an AI-powered semantic search engine for UVA courses. With it, you can search for courses using regular natural language and get results similar to your query.        
        </p>

        <p>Example queries include: </p>
          <li>How has music evolved over time? 🎹</li>
          <li>What happened before the Big Bang? 💥</li>
          <li>Famous explorers across the ages 🌎</li>
          <li>How will artificial intelligence impact society? 🤖</li>
          <li>What is the meaning of life? 🤔</li>

          <p>You can also filter based on academic level and semester. Currently, we have indexed courses from previous semesters dataing back to Fall 2021.</p>


          If you have any questions or feedback, please reach out to us through this <a href="https://forms.gle/Jq2di8Zji4tDNKZF8">form</a>. We hope you find this tool useful 😊. 
          </div>

<div>
        <button onClick={closeModal} className="close-button">X</button>
        </div>

      </Modal>


        <p style={{fontFamily:'Courier', fontSize:'60px'}}>UVA Course Explorer</p>
        <SearchComponent />
      </header>
      <GitHubIcon />
    </div>
  );
}

export default App;
