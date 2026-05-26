import React from 'react';

interface NarrativeSectionProps {
  imageLeft: string;
  imageRight: string;
}

export const NarrativeSection: React.FC<NarrativeSectionProps> = ({ imageLeft, imageRight }) => {
  return (
    <section className="bg-canvas-pure py-28 md:py-40 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center relative">
        
        {/* Bloco de Imagem Esquerdo Grande - Linhas Editoriais */}
        <div className="lg:col-span-5 w-full h-[450px] md:h-[600px] bg-canvas-studio overflow-hidden rounded-subtle shadow-sm">
          <img 
            src={imageLeft} 
            alt="Foco de luz natural em estúdio" 
            className="w-full h-full object-cover grayscale contrast-[1.08] hover:scale-102 transition-transform duration-700"
          />
        </div>

        {/* Caixa de Texto Conceitual Suspensa (Sobreposta no Desktop) */}
        <div className="lg:col-span-4 lg:absolute lg:left-[38%] lg:z-20 bg-canvas-pure/90 backdrop-blur-sm lg:p-12 border border-ink-border space-y-6 rounded-subtle p-6">
          <span className="text-[9px] uppercase tracking-[0.3em] text-ink-secondary block">
            Manifesto Artístico
          </span>
          <h2 className="font-serif text-2xl md:text-4xl text-ink-primary font-light leading-snug tracking-wide">
            O Silêncio Confortável da Imagem.
          </h2>
          <p className="font-sans text-xs text-ink-secondary leading-relaxed tracking-wide text-justify">
            Acreditamos na fotografia livre de poses mecânicas ou artifícios saturados. Nosso estúdio desenha registros com foco na luz orgânica e nas interações cruas. Moldamos memórias com a mesma delicácia de páginas viradas de uma revista física de alta-costura.
          </p>
        </div>

        {/* Bloco de Imagem Direito Menor - Deslocado para Baixo */}
        <div className="lg:col-span-3 lg:mt-32 w-full h-[350px] md:h-[480px] bg-canvas-studio overflow-hidden rounded-subtle shadow-sm">
          <img 
            src={imageRight} 
            alt="Detalhe de textura orgânica e composição" 
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
          />
        </div>

      </div>
    </section>
  );
};