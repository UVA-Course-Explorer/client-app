import Modal from 'react-modal';
import React, { useState} from "react";
import Catalog from './Catalog';
import SearchComponent from './SearchComponent';
import CatalogPage from './CatalogPage';
import { render } from '@testing-library/react';

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
                  <button onClick={openModal} className="fixed-button" style={{textAlign: "center"}}>ⓘ</button>
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
            
                      <p>You can also filter based on academic level and semester. Currently, we have indexed courses from previous semesters dating back to Fall 2021.</p>
                      If you have any questions or feedback, please reach out to us through this <a href="https://forms.gle/Jq2di8Zji4tDNKZF8">form</a>. We hope you find this tool useful 😊. 
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
                    
                   
                  </header>
                  {content}
                  
                </div>
              );
}




export default PageTemplate;