import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      // Insere o e-mail na tabela 'newsletter' do Supabase
      const { error } = await supabase
        .from('newsletter')
        .insert([{ email, created_at: new Date().toISOString() }]);

      if (error) throw error;

      // Alerta estético de sucesso
      toast.success('Inscrição confirmada com elegância.', {
        className: 'font-sans text-xs uppercase tracking-wider text-ink-primary bg-canvas-pure border border-ink-border'
      });
      
      setEmail('');
    } catch (err: any) {
      toast.error('Não foi possível processar seu cadastro no momento.', {
        className: 'font-sans text-xs uppercase tracking-wider text-red-500 bg-canvas-pure border border-red-200'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-canvas-off py-24 px-6 border-t border-ink-border text-center">
      <div className="max-w-xl mx-auto space-y-6">
        <span className="text-[9px] uppercase tracking-[0.3em] text-ink-secondary block">
          Acesso Exclusivo
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink-primary font-light tracking-wide">
          Notícias da Curadoria
        </h2>
        <p className="font-sans text-xs text-ink-secondary max-w-sm mx-auto leading-relaxed tracking-wide">
          Inscreva seu e-mail para receber notas sobre novas coleções visuais, ensaios abertos e ensaios autorais.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
          <input 
            type="email" 
            required 
            disabled={isSubmitting}
            placeholder="SEU MELHOR E-MAIL" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-canvas-pure border border-ink-border px-4 py-3 text-xs tracking-widest text-ink-primary rounded-subtle focus:outline-none focus:border-ink-primary transition-colors disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="border border-ink-primary text-ink-primary text-xs uppercase tracking-widest px-8 py-3 rounded-subtle hover:bg-ink-primary hover:text-canvas-pure transition-all duration-500 whitespace-nowrap disabled:opacity-40"
          >
            {isSubmitting ? 'Enviando...' : 'Fazer Parte'}
          </button>
        </form>
      </div>
    </section>
  );
};