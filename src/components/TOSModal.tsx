import React from 'react';
import Modal from './Modal';
import TOSScreen from './TOSScreen';

interface TOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOSModal: React.FC<TOSModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service">
      <TOSScreen />
    </Modal>
  );
};

export default TOSModal;