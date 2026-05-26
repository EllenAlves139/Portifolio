import { useState } from 'react';
import { Layout } from './components/Layout';
import { HeroCarousel } from './features/home/components/HeroCarousel';
import { NarrativeSection } from './features/home/components/NarrativeSection';
import { AlbumGrid } from './features/album/components/AlbumGrid';
import { NewsletterForm } from './features/newsletter/components/NewsletterForm';
import { ChatWidget } from './components/ChatWidget';
import { AdminCMS } from './features/admin/components/AdminCMS';
import { Toaster } from 'sonner';

// ============================================================================
// MOCKS DE DADOS COMPATÍVEIS (Amostra Estática para a Home)
// ============================================================================
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

const mockPhotosHome = [
  { 
    id: 'a', 
    url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=1000', 
    alt: 'Maternidade minimalista', 
    aspectRatio: 'vertical' as const 
  },
  { 
    id: 'b', 
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200', 
    alt: 'Casamento editorial', 
    aspectRatio: 'horizontal' as const 
  },
  { 
    id: 'c', 
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800', 
    alt: 'Retrato intimista de estúdio', 
    aspectRatio: 'square' as const 
  },
  { 
    id: 'd', 
    url: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?q=80&w=800', 
    alt: 'Luz natural de fim de tarde', 
    aspectRatio: 'vertical' as const 
  }
];

export default function App() {
  // Gerenciador reativo da tela ativa atual ('home' | 'admin')
  const [currentView, setCurrentView] = useState<string>('home');

  return (
    <Layout setView={setCurrentView} currentView={currentView}>
      {/* Provedor global invisível de toasts flutuantes */}
      <Toaster position="bottom-right" />
      
      {/* FLUXO A: RENDERIZAÇÃO DA HOME PAGE PÚBLICA */}
      {currentView === 'home' && (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <HeroCarousel slides={mockSlides} />
          
          <NarrativeSection 
            imageLeft="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800"
            imageRight="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600"
          />
          
          {/* Divisor estético entre o manifesto e as mídias */}
          <div className="text-center mt-12 -mb-8">
            <span className="text-[9px] uppercase tracking-[0.3em] text-ink-secondary block">Espectro Visual</span>
            <h2 className="font-serif text-2xl md:text-3xl text-ink-primary font-light mt-1">Trabalhos em Destaque</h2>
            <div className="h-[1px] w-8 bg-ink-primary/20 mx-auto mt-4" />
          </div>

          <AlbumGrid photos={mockPhotosHome} />
          <NewsletterForm />
        </div>
      )}

      {/* FLUXO B: RENDERIZAÇÃO DO CURADORIA (CMS) COM LOGIN EMBUTIDO */}
      {currentView === 'admin' && (
        <div className="pt-8">
          <AdminCMS />
        </div>
      )}

      {/* Widget Flutuante de Mensagens Fixo em Ambas as Telas */}
      <ChatWidget />
    </Layout>
  );
}