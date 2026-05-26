import React, { useState, useEffect, useRef } from 'react';

interface Slide {
  id: string;
  url: string;
  title: string;
  subtitle: string;
}

interface HeroCarouselProps {
  slides: Slide[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Loop de transição automática suave
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Manipuladores de Gesto (Swipe) Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Se o deslize for maior que 50px, troca de imagem
    if (diffX > 50) {
      // Swipe para a esquerda -> Próximo
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    } else if (diffX < -50) {
      // Swipe para a direita -> Anterior
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
    touchStartX.current = null;
  };

  if (slides.length === 0) return null;

  return (
    <section 
      className="relative w-full h-screen bg-canvas-studio overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Máscara de vinheta escura sutil sobre as mídias */}
      <div className="absolute inset-0 bg-ink-primary/10 z-10 pointer-events-none" />

      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover select-none scale-100"
            draggable="false"
          />
          
          {/* Tipografia Centralizada Suspensa */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-6">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-canvas-pure mb-4 block animate-[fadeIn_0.8s_ease-out]">
              {slide.subtitle}
            </span>
            <h1 className="font-serif text-3xl md:text-6xl text-canvas-pure font-light tracking-wide max-w-3xl leading-tight md:leading-snug animate-[fadeIn_1s_ease-out]">
              {slide.title}
            </h1>
          </div>
        </div>
      ))}

      {/* Indicadores de Paginação Laterais Discretos */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center space-x-3 z-30">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-[2px] transition-all duration-500 rounded-full ${
              idx === currentIndex ? 'w-8 bg-canvas-pure' : 'w-2 bg-canvas-pure/40'
            }`}
            aria-label={`Ir para o slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};