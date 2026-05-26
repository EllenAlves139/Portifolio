import { useState } from 'react';
import { Layout } from './components/Layout';
import { HeroCarousel } from './features/home/components/HeroCarousel';
import { NarrativeSection } from './features/home/components/NarrativeSection';
import { AlbumGrid } from './features/album/components/AlbumGrid';
import { NewsletterForm } from './features/newsletter/components/NewsletterForm';
import { ChatWidget } from './components/ChatWidget';
import { AdminCMS } from './features/admin/components/AdminCMS';
import { usePortfolio } from './features/home/hooks/usePortfolio'; // Importando o buscador real
import { Toaster } from 'sonner';

const mockSlides = [
  { 
    id: '1', 
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920', 
    title: 'O Amor sob a Luz de Outono', 
    subtitle: 'Casamentos Autorais' 
  },
  { 
    id: '2', 
    url: 'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?q=80&w=1920', 
    title: 'A Poesia do Começo', 
    subtitle: 'Maternidade & Gestantes' 
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  
  // Puxando as fotos reais e o estado de carregamento do banco de dados
  const { photos, loading } = usePortfolio();

  return (
    <Layout setView={setCurrentView} currentView={currentView}>
      <Toaster position="bottom-right" />
      
      {currentView === 'home' && (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <HeroCarousel slides={mockSlides} />
          
          <NarrativeSection 
            imageLeft="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800"
            imageRight="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600"
          />
          
          <div className="text-center mt-12 -mb-8">
            <span className="text-[9px] uppercase tracking-[0.3em] text-ink-secondary block">Espectro Visual</span>
            <h2 className="font-serif text-2xl md:text-3xl text-ink-primary font-light mt-1">Trabalhos em Destaque</h2>
            <div className="h-[1px] w-8 bg-ink-primary/20 mx-auto mt-4" />
          </div>

          {/* LÓGICA DE EXIBIÇÃO DINÂMICA */}
          {loading ? (
            <div className="text-center py-24 text-xs uppercase tracking-widest text-ink-secondary">
              Carregando Curadoria...
            </div>
          ) : photos.length > 0 ? (
            // Se houver fotos no Supabase, exibe a grade real
            <AlbumGrid photos={photos} />
          ) : (
            // Se o banco estiver vazio (primeiro acesso)
            <div className="text-center py-24 px-6 border border-dashed border-ink-border max-w-4xl mx-auto my-16 rounded-subtle bg-canvas-off">
              <p className="text-xs uppercase tracking-widest text-ink-secondary">
                Nenhum registro público no momento.
              </p>
              <button 
                onClick={() => setCurrentView('admin')}
                className="mt-4 text-[10px] uppercase tracking-widest bg-ink-primary text-canvas-pure px-4 py-2 rounded-subtle"
              >
                Acessar Painel e Publicar Fotos
              </button>
            </div>
          )}

          <NewsletterForm />
        </div>
      )}

      {currentView === 'admin' && (
        <div className="pt-8">
          <AdminCMS />
        </div>
      )}

      <ChatWidget />
    </Layout>
  );
}