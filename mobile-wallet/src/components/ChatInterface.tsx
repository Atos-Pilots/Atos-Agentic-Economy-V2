import { useState, useEffect } from 'react';

type Message = { id: number; sender: 'user' | 'agent'; text: string; isOffer?: boolean };

export const ChatInterface = ({ onProceedToCheckout }: { onProceedToCheckout: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Simulated sequence of conversational intent capture
    const timers = [
      setTimeout(() => setMessages([{ id: 1, sender: 'agent', text: 'Bonjour C. Von N. Quel est votre besoin aujourd\'hui ?' }]), 500),
      setTimeout(() => setMessages(prev => [...prev, { id: 2, sender: 'user', text: 'Sérum hydratant Sephora, budget 60€, expédition incluse.' }]), 2500),
      setTimeout(() => setMessages(prev => [...prev, { id: 3, sender: 'agent', text: 'Sondage immédiat des agents marchands UCP du registre...' }]), 4000),
      setTimeout(() => setMessages(prev => [...prev, { id: 4, sender: 'agent', text: 'Offre retenue : Sephora Premium Sérum (50.00 EUR)', isOffer: true }]), 6500)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="chat-container">
      {messages.map((m) => (
        <div key={m.id} className={`chat-bubble ${m.sender}`}>
          <p>{m.text}</p>
          {m.isOffer && (
            <div style={{ marginTop: '16px' }}>
                <button className="primary-button" onClick={onProceedToCheckout}>
                  <span>Approuver & Déléguer</span>
                </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
