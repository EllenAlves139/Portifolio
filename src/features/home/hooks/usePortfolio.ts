import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

// Tipagem idêntica à estrutura que criamos no banco de dados
interface Photo {
  id: string;
  url: string;
  alt: string;
  aspectRatio: 'vertical' | 'horizontal' | 'square';
}

export function usePortfolio() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true);
        
        // Busca as fotos direto da tabela do Supabase, ordenando pelo index definido no Admin
        const { data, error } = await supabase
          .from('photos')
          .select('id, url, alt, aspect_ratio')
          .order('order_index', { ascending: true });

        if (error) throw error;

        if (data) {
          // Mapeia o padrão snake_case do banco para o camelCase do TypeScript
          const formattedPhotos = data.map((p: any) => ({
            id: p.id,
            url: p.url,
            alt: p.alt,
            aspectRatio: p.aspect_ratio
          }));
          
          setPhotos(formattedPhotos);
        }
      } catch (error) {
        console.error('Erro ao carregar fotos do portfólio:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  return { photos, loading };
}