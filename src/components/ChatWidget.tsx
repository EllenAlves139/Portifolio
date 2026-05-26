import React, { useState } from 'react';
import { toast } from 'sonner';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulação de envio / Integração simples com webhook ou aviso em tela
    toast.success('Sua mensagem foi enviada. Entraremos em contato via e-mail.', {
      className: 'font-sans text-xs uppercase tracking-wider'
    });
    
    setFormData({ name: '', email: '', message: '' });
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-left">
      {/* Botão de Acionamento Circular */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-12 h-12 bg-ink-primary text-canvas-pure rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none"
        aria-label="Abrir formulário de contato"
      >
        {isOpen ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Caixa de Mensagem Expandida */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[310px] bg-canvas-pure border border-ink-border p-6 shadow-xl rounded-subtle animate-[fadeIn_0.2s_ease-out]">
          <h3 className="font-serif text-base text-ink-primary mb-1">Atendimento Direto</h3>
          <p className="text-[10px] text-ink-secondary uppercase tracking-wider mb-4 border-b border-ink-border pb-2">Consulte datas disponíveis</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="SEU NOME" 
                required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b border-ink-border py-1.5 text-xs text-ink-primary focus:outline-none focus:border-ink-primary tracking-widest transition-colors"
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="E-MAIL DE CONTATO" 
                required 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-b border-ink-border py-1.5 text-xs text-ink-primary focus:outline-none focus:border-ink-primary tracking-widest transition-colors"
              />
            </div>
            <div>
              <textarea 
                placeholder="CONTE DETALHES DO SEU EVENTO..." 
                required 
                rows={3}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-transparent border-b border-ink-border py-1.5 text-xs text-ink-primary focus:outline-none focus:border-ink-primary tracking-wide resize-none transition-colors"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-ink-primary text-canvas-pure text-[10px] uppercase tracking-widest py-2.5 rounded-subtle hover:bg-ink-secondary transition-colors duration-300"
            >
              Enviar Solicitação
            </button>
          </form>
        </div>
      )}
    </div>
  );
};