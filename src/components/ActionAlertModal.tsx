import React from 'react';
import { CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';

interface ActionAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'save' | 'update' | 'validation';
  boothNo: string;
  message: string;
}

export const ActionAlertModal: React.FC<ActionAlertModalProps> = ({
  isOpen,
  onClose,
  type,
  boothNo,
  message
}) => {
  if (!isOpen) return null;

  const isUpdate = type === 'update';
  const isValidation = type === 'validation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        
        {/* Top Accent Stripe */}
        <div className={`h-2 w-full ${
          isValidation ? 'bg-rose-500' : isUpdate ? 'bg-emerald-500' : 'bg-amber-500'
        }`} />

        <div className="p-6 text-center space-y-4">
          {/* Animated Icon */}
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-inner ${
            isValidation 
              ? 'bg-rose-100 text-rose-600' 
              : isUpdate 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-amber-100 text-amber-600'
          }`}>
            {isValidation ? (
              <AlertTriangle className="w-8 h-8" />
            ) : isUpdate ? (
              <RefreshCw className="w-8 h-8" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">
              {isValidation 
                ? 'सभी फ़ील्ड्स अनिवार्य हैं!' 
                : isUpdate 
                  ? 'डेटा अपडेट सफल!' 
                  : 'डेटा सुरक्षित (Save) सफल!'}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {isValidation 
                ? `बूथ सं० ${boothNo} • अनिवार्य फ़ील्ड सत्यापन` 
                : `बूथ सं० ${boothNo} • गूगल शीट रियल-टाइम सिंक`}
            </p>
          </div>

          {/* Message Box */}
          <div className={`border rounded-xl p-3.5 text-xs leading-relaxed font-medium text-left ${
            isValidation 
              ? 'bg-rose-50/80 border-rose-200 text-rose-900' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            {message}
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              autoFocus
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                isValidation 
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-95' 
                  : isUpdate 
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95' 
                    : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
              }`}
            >
              {isValidation ? 'ठीक है, फ़ील्ड भरें (OK)' : 'ठीक है (OK)'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
