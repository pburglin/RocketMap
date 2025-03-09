import React from 'react';
import Modal from './Modal';
import AboutScreen from './AboutScreen';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About">
      <AboutScreen />
    </Modal>
  );
};

export default AboutModal;
