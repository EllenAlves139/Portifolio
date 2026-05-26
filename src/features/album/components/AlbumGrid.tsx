import React, { useState, useEffect } from 'react';

// Tipagem estrita para as fotos injetadas no grid
interface Photo {
  id: string;
  url: string;
  alt: string;
  aspectRatio: 'vertical' | 'horizontal' | 'square';
}

interface AlbumGridProps {
  photos: Photo[];
}

export const AlbumGrid: React.FC<AlbumGridProps> = ({ photos }) => {
  // Gerencia qual imagem está aberta no visualizador em tela cheia (null = fechado)
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Captura eventos de teclado para navegação acessível e profissional
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev! + 1) % photos.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev! - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, photos.length]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      {/* Grid Dinâmico usando CSS Grid Avançado. 
        As linhas possuem altura travada em 260px, e os elementos expandem 
        seu posicionamento conforme a orientação da imagem (vertical ocupa 2 linhas, horizontal 2 colunas).
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[260px]">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => setActiveIndex(index)}
            className={`overflow-hidden group cursor-pointer relative bg-canvas-studio rounded-subtle shadow-sm ${
              photo.aspectRatio === 'vertical' 
                ? 'row-span-2' 
                : photo.aspectRatio === 'horizontal' 
                ? 'col-span-1 md:col-span-2' 
                : 'row-span-1'
            }`}
          >
            {/* Imagem com transição de aproximação ultra-lenta (Zoom Editorial) */}
            <img
              src={photo.url}
              alt={photo.alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out scale-100 group-hover:scale-103 grayscale hover:grayscale-0 duration-700"
            />
            {/* Máscara de sombreamento sutil ao passar o mouse */}
            <div className="absolute inset-0 bg-ink-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* ============================================================================
          MECANISMO DE LIGHTBOX (Visualizador em Tela Cheia)
          ============================================================================ */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-canvas-pure flex items-center justify-center select-none animate-[fadeIn_0.2s_ease-out]">
          
          {/* Botão Fechar (Canto Superior Direito) */}
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute top-8 right-8 text-ink-primary p-2 hover:opacity-50 transition-opacity focus:outline-none"
            aria-label="Fechar visualizador"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Botão Voltar (Navegação Esquerda) */}
          <button
            onClick={() => setActiveIndex((prev) => (prev! - 1 + photos.length) % photos.length)}
            className="absolute left-6 text-ink-primary p-4 hover:opacity-40 transition-opacity focus:outline-none"
            aria-label="Imagem anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Contêiner Central da Imagem Ativa */}
          <div className="max-w-[85vw] max-h-[85vh] text-center flex flex-col items-center justify-center">
            <img
              src={photos[activeIndex].url}
              alt={photos[activeIndex].alt}
              className="max-w-full max-h-[75vh] object-contain shadow-md rounded-subtle animate-[scaleIn_0.3s_ease-out]"
            />
            {/* Contador e legenda em fonte minimalista */}
            <p className="mt-6 font-sans text-[10px] tracking-[0.2em] text-ink-secondary uppercase">
              {activeIndex + 1} / {photos.length} — {photos[activeIndex].alt}
            </p>
          </div>

          {/* Botão Avançar (Navegação Direita) */}
          <button
            onClick={() => setActiveIndex((prev) => (prev! + 1) % photos.length)}
            className="absolute right-6 text-ink-primary p-4 hover:opacity-40 transition-opacity focus:outline-none"
            aria-label="Próxima imagem"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>
      )}
    </div>
  );
};