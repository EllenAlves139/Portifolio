import React, { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  setView: (view: string) => void;
  currentView: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, setView, currentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-canvas-pure text-ink-primary font-sans antialiased flex flex-col">
      {/* Cabeçalho Editorial Sincronizado */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-canvas-pure/90 backdrop-blur-md border-ink-border py-4' 
          : 'bg-transparent border-transparent py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo Minimalista de Alta-Costura */}
          <button 
            onClick={() => setView('home')} 
            className="font-serif text-xl md:text-2xl tracking-[0.2em] uppercase text-ink-primary hover:opacity-70 transition-opacity"
          >
            Avelar
          </button>
          
          {/* Menu de Navegação por Estados */}
          <nav className="flex items-center space-x-8 md:space-x-12">
            <button 
              onClick={() => setView('home')} 
              className={`text-[10px] uppercase tracking-widest transition-colors ${
                currentView === 'home' ? 'text-ink-primary font-medium' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Portfólio
            </button>
            <button 
              onClick={() => setView('admin')} 
              className={`text-[10px] uppercase tracking-widest transition-colors ${
                currentView === 'admin' ? 'text-ink-primary font-medium' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Curadoria
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Dinâmico das Telas */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Rodapé Invisível Premium */}
      <footer className="bg-canvas-off border-t border-ink-border py-12 px-6 md:px-12 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] tracking-widest uppercase text-ink-secondary">
            © {new Date().getFullYear()} Avelar Estúdio. Fotografia Autoral Romântica.
          </p>
          <p className="text-[9px] tracking-widest uppercase text-ink-secondary/60">
            Molduras Invisíveis de Luxo.
          </p>
        </div>
      </footer>
    </div>
  );
};