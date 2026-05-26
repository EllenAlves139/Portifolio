import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast, Toaster } from 'sonner';

// Interfaces estritas para controle do fluxo de uploads
interface UploadingFile {
  id: string;
  file: File;
  status: 'idle' | 'uploading' | 'success' | 'error';
  aspectRatio: 'vertical' | 'horizontal' | 'square';
}

export const AdminCMS: React.FC = () => {
  // Estados de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados do Álbum
  const [albumInfo, setAlbumInfo] = useState({ title: '', subtitle: '' });
  const [isAlbumCreated, setIsAlbumCreated] = useState(false);
  const [createdAlbumId, setCreatedAlbumId] = useState<string | null>(null);
  
  // Estados da Fila de Arquivos
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // ============================================================================
  // 1. UTILITÁRIOS INTERNOS (Compressão e Orientação de Imagem)
  // ============================================================================
  const compressImage = (file: File, maxWidth = 1920, quality = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              reject(new Error('Erro ao converter Canvas para Blob'));
            }
          }, 'image/jpeg', quality);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const calculateOrientation = (file: File): Promise<'vertical' | 'horizontal' | 'square'> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const ratio = img.width / img.height;
        URL.revokeObjectURL(img.src);
        if (ratio > 1.2) resolve('horizontal');
        if (ratio < 0.8) resolve('vertical');
        resolve('square');
      };
    });
  };

  // ============================================================================
  // 2. MANIPULADORES DE EVENTOS
  // ============================================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast.error('Credenciais administrativas inválidas.');
    } else if (data.session) {
      setIsAuthenticated(true);
      toast.success('Acesso à curadoria autorizado.');
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug = albumInfo.title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    try {
      const { data, error } = await supabase
        .from('albums')
        .insert([{ title: albumInfo.title, subtitle: albumInfo.subtitle, slug: generatedSlug }])
        .select('id')
        .single();

      if (error) throw error;
      
      setCreatedAlbumId(data.id);
      setIsAlbumCreated(true);
      toast.success('Sessão iniciada com sucesso. Selecione as mídias.');
    } catch (err: any) {
      toast.error(`Falha ao criar sessão: ${err.message}`);
    }
  };

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const validFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    
    const mappedItems = await Promise.all(
      validFiles.map(async (file) => ({
        id: crypto.randomUUID(),
        file,
        status: 'idle' as const,
        aspectRatio: await calculateOrientation(file)
      }))
    );
    
    setUploadQueue(prev => [...prev, ...mappedItems]);
  };

  const handleBatchUpload = async () => {
    if (!createdAlbumId || uploadQueue.length === 0) return;
    setIsProcessing(true);

    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q));

      try {
        // Aplica a compressão client-side antes do tráfego de rede
        const compressed = await compressImage(item.file);
        const fileExt = item.file.name.split('.').pop();
        const storagePath = `${createdAlbumId}/${item.id}.${fileExt}`;

        // 1. Envia para o Bucket do Storage (Crie um bucket chamado 'portfolio-photos' público no Supabase)
        const { error: storageErr } = await supabase.storage
          .from('portfolio-photos')
          .upload(storagePath, compressed, { cacheControl: '3600', upsert: true });

        if (storageErr) throw storageErr;

        // 2. Captura a URL pública definitiva
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-photos')
          .getPublicUrl(storagePath);

        // 3. Registra a referência indexada na tabela relacional 'photos'
        const { error: dbErr } = await supabase.from('photos').insert([{
          album_id: createdAlbumId,
          url: publicUrl,
          alt: `${albumInfo.title} — Imagem ${i + 1}`,
          aspect_ratio: item.aspectRatio,
          order_index: i
        }]);

        if (dbErr) throw dbErr;

        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'success' } : q));
      } catch {
        setQueueItemError(item.id);
      }
    }

    setIsProcessing(false);
    toast.success('Álbum sincronizado e publicado com sucesso!');
    setTimeout(() => {
      setIsAlbumCreated(false);
      setUploadQueue([]);
      setAlbumInfo({ title: '', subtitle: '' });
    }, 1500);
  };

  const setQueueItemError = (id: string) => {
    setUploadQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'error' } : q));
  };

  // ============================================================================
  // 3. RENDERIZAÇÃO DA INTERFACE (Telas Alternadas)
  // ============================================================================
  
  // TELA A: Escudo de Autenticação (Guard)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas-off flex items-center justify-center px-6 pt-24">
        <Toaster position="bottom-right" />
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-canvas-pure border border-ink-border p-8 space-y-6 rounded-subtle shadow-sm">
          <div className="text-center">
            <h2 className="font-serif text-lg tracking-[0.2em] uppercase text-ink-primary">Curadoria Privada</h2>
            <p className="text-[10px] text-ink-secondary tracking-widest uppercase mt-1">Painel Administrativo</p>
          </div>
          <div className="space-y-4">
            <input 
              type="email" placeholder="E-MAIL CREDENCIADO" required value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-transparent border-b border-ink-border py-2 text-xs tracking-widest text-ink-primary focus:outline-none focus:border-ink-primary" 
            />
            <input 
              type="password" placeholder="CHAVE DE ACESSO" required value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-transparent border-b border-ink-border py-2 text-xs tracking-widest text-ink-primary focus:outline-none focus:border-ink-primary" 
            />
          </div>
          <button type="submit" className="w-full bg-ink-primary text-canvas-pure text-xs uppercase py-3 tracking-widest rounded-subtle hover:bg-ink-secondary transition-colors">
            Autenticar
          </button>
        </form>
      </div>
    );
  }

  // TELA B: Área Autônoma do CMS (Criação e Lote)
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 bg-canvas-pure border border-ink-border mt-32 mb-16 rounded-subtle shadow-sm">
      <Toaster position="bottom-right" />
      <div className="mb-8">
        <h2 className="font-serif text-2xl text-ink-primary">Nova Coleção Visual</h2>
        <p className="text-[10px] text-ink-secondary uppercase tracking-widest mt-1">Gerencie os registros do portfólio</p>
      </div>

      {!isAlbumCreated ? (
        <form onSubmit={handleCreateAlbum} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input 
              type="text" placeholder="TÍTULO DO ENSAIO (Ex: Julia em Petrópolis)" required value={albumInfo.title} 
              onChange={e => setAlbumInfo({...albumInfo, title: e.target.value})} 
              className="w-full bg-transparent border-b border-ink-border py-2 text-xs tracking-wider focus:outline-none focus:border-ink-primary" 
            />
            <input 
              type="text" placeholder="CATEGORIA (Ex: Casamento Editorial)" required value={albumInfo.subtitle} 
              onChange={e => setAlbumInfo({...albumInfo, subtitle: e.target.value})} 
              className="w-full bg-transparent border-b border-ink-border py-2 text-xs tracking-wider focus:outline-none focus:border-ink-primary" 
            />
          </div>
          <button type="submit" className="bg-ink-primary text-canvas-pure text-xs uppercase tracking-widest px-8 py-3 rounded-subtle hover:bg-ink-secondary transition-colors">
            Registrar Metadados
          </button>
        </form>
      ) : (
        <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
          <div className="p-4 bg-canvas-off border border-ink-border text-xs text-ink-primary rounded-subtle">
            <strong>Sessão Ativa:</strong> {albumInfo.title} — <span className="text-ink-secondary">{albumInfo.subtitle}</span>
          </div>

          <div className="w-full h-36 border border-dashed border-ink-border bg-canvas-off flex flex-col items-center justify-center relative rounded-subtle">
            <input 
              type="file" multiple accept="image/*" disabled={isProcessing}
              onChange={handleFileSelection} 
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            />
            <p className="text-xs uppercase tracking-wider text-ink-primary">Arraste ou Clique para Selecionar Fotos</p>
          </div>

          {uploadQueue.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest text-ink-primary font-medium">Mídias em Fila ({uploadQueue.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {uploadQueue.map(item => (
                  <div key={item.id} className="relative aspect-square border border-ink-border bg-canvas-studio overflow-hidden rounded-subtle">
                    <img src={URL.createObjectURL(item.file)} alt="preview" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 flex flex-col items-center justify-center text-[9px] uppercase tracking-wider font-medium text-canvas-pure bg-black/60 transition-opacity duration-300 ${
                      item.status === 'idle' ? 'opacity-0 hover:opacity-100 bg-black/20' : 'opacity-100'
                    }`}>
                      {item.status === 'idle' && <span>{item.aspectRatio}</span>}
                      {item.status === 'uploading' && <span className="text-amber-300 animate-pulse">Processando...</span>}
                      {item.status === 'success' && <span className="text-green-400">Salvo</span>}
                      {item.status === 'error' && <span className="text-red-400">Erro</span>}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleBatchUpload} disabled={isProcessing}
                className="w-full bg-ink-primary text-canvas-pure text-xs uppercase tracking-widest py-3.5 rounded-subtle hover:bg-ink-secondary transition-colors disabled:opacity-40"
              >
                {isProcessing ? 'Sincronizando com o Cloud Storage...' : 'Publicar Álbum Definitivo'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};