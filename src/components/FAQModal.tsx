import React from 'react';
import Modal from './Modal';
import FAQScreen from './FAQScreen';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="FAQ">
      <FAQScreen />
    </Modal>
  );
};

export default FAQModal;