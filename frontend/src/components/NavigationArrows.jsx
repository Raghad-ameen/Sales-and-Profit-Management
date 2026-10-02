import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './NavigationArrows.css';

const NavigationArrows = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = (direction) => {
    if (direction === 'back') {
      if (location.pathname.includes('dashboard')) {
        // نستخدم الانتقال المباشر للهوم مع إجبار الصفحة على التحديث 
        // لكسر حلقة الـ AuthHandler الإجبارية
        window.location.href = '/';
      } else {
        navigate(-1);
      }
    } else {
      navigate(1);
    }
  };

  return (
    <div className="nav-arrows-wrapper-clean">
      {/* السهم < للتقدم للأمام */}
      <button onClick={() => handleAction('forward')} className="nav-arrow-minimal">
        <ChevronLeft size={28} strokeWidth={3} />
      </button>

      {/* السهم > للرجوع للهوم */}
      <button onClick={() => handleAction('back')} className="nav-arrow-minimal">
        <ChevronRight size={28} strokeWidth={3} />
      </button>
    </div>
  );
};

export default NavigationArrows;