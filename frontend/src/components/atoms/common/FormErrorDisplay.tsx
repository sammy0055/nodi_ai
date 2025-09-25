import { FiAlertCircle } from 'react-icons/fi';

interface FormErrorDisplayProps {
  error: string;
}
export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ error }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg">
      <FiAlertCircle className="text-error-600 flex-shrink-0" />
      <span className="text-sm">{error}</span>
    </div>
  );
};
