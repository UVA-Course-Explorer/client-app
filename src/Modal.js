import React, { useState } from 'react';
import Modal from 'react-modal';

const Modal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <button onClick={openModal} style={{ marginRight: '10px' }}>
        Open Modal
      </button>


      <button onClick={openModal}>Open Modal</button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        className={{
          base: 'fade',
          afterOpen: 'fade-enter',
          beforeClose: 'fade-exit',
        }}
        overlayClassName={{
          base: 'fade-overlay',
          afterOpen: 'fade-overlay-enter',
          beforeClose: 'fade-overlay-exit',
        }}
      >
        <h2 className="modal-content">Modal Content</h2>
        <p className="modal-content">This is the content of the modal.</p>
        <button onClick={closeModal} className="modal-button">
          Close Modal
        </button>
      </Modal>


    </div>
  );
};

export default Modal;
