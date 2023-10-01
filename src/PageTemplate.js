import Modal from 'react-modal';
import React, { useState} from "react";
import Catalog from './Catalog';
import SearchComponent from './SearchComponent';
import CatalogPage from './CatalogPage';
import './modalStyles.css'

function PageTemplate(props){
    
  const [isModalOpen, setIsModalOpen] = useState(false);

  Modal.setAppElement('#root');

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const renderTarget = props.target;
  console.log(renderTarget);
  let content;

  if (renderTarget === "search"){
    content = <SearchComponent/>;
  } else if (renderTarget === "catalog"){
    content = <Catalog/>;
  }
  else if (renderTarget === "catalog-page"){
    content = <CatalogPage department_abbr={props.data}/>;
  }
  
  return (
    <div className="App">
      <header className="App-header">

        { renderTarget !== "catalog-page" && <button onClick={openModal} className="fixed-button" style={{textAlign: "center"}}>ⓘ</button>}
      
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Example Modal"
          className="modal">
  
          <div className='scroll-div'>
            <h2 className="modal-content">Info</h2>
            <span className="modal-content">
              This is an AI-powered search engine and catalog for UVA courses. With you can search for courses using natural language and view near-realtime information about any class at UVA.        
            </span>
            <br></br><br></br>

            <span>Example queries include: </span>
            <li>How has music evolved over time? 🎹</li>
            <li>What happened before the Big Bang? 💥</li>
            <li>How will artificial intelligence impact society? 🤖</li>

            <br></br>
            <span>You can also search for a specific class with its department and course number (CS 1110). We have indexed courses from previous semesters dating back to Fall 2021 for the search engine.</span>
            
            <br></br>
            <br></br>

            <span>Our catalog contains course information for the latest semester and is updated hourly.</span>
            <br></br>
            <br></br>


            If you have any questions or feedback, please reach out to us through this <a href="https://forms.gle/Jq2di8Zji4tDNKZF8" className="modal-link">form</a>. 
            For a technical overview of the project and a discussion of its limitations, please refer to our <a href="https://github.com/UVA-Course-Explorer" className="modal-link">GitHub</a>.
            
            <br></br> <br></br>
            We hope you find this tool useful 😊.
          </div>
          <div>
            <button onClick={closeModal} className="close-button">X</button>
          </div>
        </Modal>

        <p className="App-Title">UVA Course Explorer</p>
        <div className="nav-bar">
          <a className={`nav-button ${renderTarget === 'search' ? 'underlined' : ''}`} href="/search">Search</a>
          <a className={`nav-button ${renderTarget === 'catalog' || renderTarget==='catalog-page' ? 'underlined' : ''}`} href="/catalog">Catalog</a>
        </div>
        {content}
      </header>
    </div>
  );
}

export default PageTemplate;