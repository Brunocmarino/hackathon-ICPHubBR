import React from "react";

const Modal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null; // Não renderiza o modal se isOpen for false

  return (    
      <div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[100]">
        <div class="bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 class="text-xl font-bold mb-4">{title}</h2>
          <p class="mb-4">{message}</p>
          <button onClick={onClose} class="px-4 py-2 bg-[#666666] text-white rounded  hover:bg-[#555555]" >
            Ok
          </button>
        </div>
      </div>      
  );
};

export default Modal;