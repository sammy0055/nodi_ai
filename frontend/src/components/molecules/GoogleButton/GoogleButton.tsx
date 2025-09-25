import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import Button from '../../atoms/Button/Button';

interface GoogleButtonProps {
  onClick: () => void;
  text: string;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, text }) => {
  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-3 py-2.5"
      onClick={onClick}
    >
      <FcGoogle className="text-lg" />
      <span>{text} with Google</span>
    </Button>
  );
};

export default GoogleButton;