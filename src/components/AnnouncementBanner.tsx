import { X } from "lucide-react";
import { useState } from "react";

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-center">
        <p className="text-sm md:text-base text-center font-medium">
          🎯 Agende sua primeira consulta e inicie sua jornada de autoconhecimento
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Fechar banner"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
