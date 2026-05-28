import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePublishAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      alert("Por favor, selecione ao menos uma foto.");
      return;
    }

    setLoading(true);

    try {
      // Passo 1: Criar o Álbum na tabela 'albums' e salvar os metadados
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert({
          title: title,
          subtitle: subtitle,
          description: description,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (albumError) {
        console.error("Erro ao registrar metadados do álbum:", albumError);
        throw new Error(`Falha nos metadados: ${albumError.message}`);
      }

      const albumId = albumData.id;

      // Passo 2: Fazer o upload de cada foto física e salvar na tabela 'photos'
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${albumId}/${fileName}`;

        // Envia o arquivo físico para o bucket 'albums'
        const { error: uploadError } = await supabase.storage
          .from('albums')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Erro no upload da foto ${file.name}:`, uploadError);
          throw uploadError;
        }

        // CORREÇÃO DO ERRO NULL: Busca a URL pública definitiva baseada no caminho construído
        const { data: urlData } = supabase.storage
          .from('albums')
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
          throw new Error(`Não foi possível gerar link público para a imagem ${file.name}`);
        }

        const publicUrl = urlData.publicUrl;

        // Insere o registro da foto vinculando-a ao ID do álbum criado
        const { error: photoDbError } = await supabase
          .from('photos')
          .insert({
            album_id: albumId,
            url: publicUrl,
            name: file.name,
            created_at: new Date().toISOString()
          });

        if (photoDbError) {
          console.error("Erro ao vincular foto no banco de dados:", photoDbError);
          throw photoDbError;
        }
      }

      alert("Álbum sincronizado e publicado com sucesso!");
      
      // Limpa os campos do formulário após o sucesso
      setTitle('');
      setSubtitle('');
      setDescription('');
      setFiles(null);

    } catch (error: any) {
      console.error("Erro durante a publicação:", error);
      alert(`Erro no percurso: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Criar Novo Álbum Definitivo</h2>
      <form onSubmit={handlePublishAlbum}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>Título do Álbum:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>Subtítulo:</label>
          <input 
            type="text" 
            value={subtitle} 
            onChange={(e) => setSubtitle(e.target.value)} 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>Descrição:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ width: '100%', padding: '8px', height: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block' }}>Selecionar Fotos:</label>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={(e) => setFiles(e.target.files)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            backgroundColor: loading ? '#ccc' : '#4CAF50', 
            color: 'white', 
            padding: '10px 15px', 
            border: 'none', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Publicando e Sincronizando...' : 'Publicar Álbum Definitivo'}
        </button>
      </form>
    </div>
  );
}