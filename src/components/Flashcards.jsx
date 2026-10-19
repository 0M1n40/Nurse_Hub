import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { Button, Card, OpenTag, Pill, SourceTag, Spinner, Tag } from './ui.jsx';

// Filtros de origem: tudo, só o que caiu na prova, só monitoria/estudo dirigido ou os dois
const ORIGINS = [
  { id: '', label: '📚 Tudo', match: () => true },
  { id: 'past', label: '⭐ Prova + monitoria/ED', match: (s) => !!s },
  { id: 'prova', label: '📄 Só prova', match: (s) => !!s && s.includes('prova') },
  { id: 'ed', label: '📘 Só monitoria/ED', match: (s) => s === 'ed' },
  { id: 'quiz', label: '🧪 Só quiz', match: (s) => !!s && s.includes('quiz') },
];

export default function Flashcards({ systems, subject }) {
  const [system, setSystem] = useState('');
  const [origin, setOrigin] = useState('');
  const [all, setAll] = useState(null);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    setAll(null);
    api.flashcards(system).then((c) => { setAll(c); setI(0); setFlip(false); });
  }, [system, subject.id]);

  // Só mostra filtros de origem que têm cartões nesta matéria
  const origins = useMemo(() => ORIGINS.filter((o) => !o.id || all?.some((c) => o.match(c.source))), [all]);
  const cards = useMemo(() => {
    const m = ORIGINS.find((o) => o.id === origin) || ORIGINS[0];
    return all?.filter((c) => m.match(c.source));
  }, [all, origin]);

  const choose = (id) => { setOrigin(id); setI(0); setFlip(false); };
  const go = (d) => { setFlip(false); setI((x) => (x + d + cards.length) % cards.length); };
  const c = cards?.[i];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">🃏 Flashcards · {subject.name}</h1>
        <div className="flex items-center gap-2">
          <select value={system} onChange={(e) => setSystem(e.target.value)} className="rounded-2xl border border-line bg-card px-3 py-2 font-semibold">
            <option value="">Todos os temas</option>
            {systems.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
          {cards && <Pill>{cards.length ? i + 1 : 0}/{cards.length}</Pill>}
        </div>
      </div>

      {origins.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {origins.map((o) => (
            <button key={o.id} onClick={() => choose(o.id)}
              className={`rounded-full px-3 py-1 text-sm font-bold transition ${origin === o.id ? 'bg-accent text-white' : 'bg-soft hover:bg-line'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}

      {!cards ? <Spinner /> : !cards.length ? (
        <Card className="text-center font-semibold text-muted">Nenhum cartão com esse filtro neste tema.</Card>
      ) : (
        <Card>
          <div className="flex flex-wrap gap-2">
            <Tag>{c.icon} {c.system}</Tag>
            {c.type === 'open' && <OpenTag />}
            <SourceTag source={c.source} />
          </div>
          <div className="perspective mt-3 h-80 cursor-pointer" onClick={() => setFlip((f) => !f)}>
            <div className={`preserve-3d relative h-full w-full transition-transform duration-500 ${flip ? 'rotate-y-180' : ''}`}>
              <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center overflow-auto rounded-3xl bg-soft p-6 text-center text-xl font-bold">
                {c.front}
                <small className="mt-4 text-sm font-semibold text-muted">{c.type === 'open' ? 'responda em voz alta e toque para conferir ↻' : 'toque para virar ↻'}</small>
              </div>
              <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center overflow-auto rounded-3xl bg-brand/15 p-6 text-center">
                <b className="text-2xl font-black text-brand">{c.back}</b>
                <p className={`mt-3 font-semibold ${c.type === 'open' ? 'text-left text-sm leading-relaxed' : ''}`}>{c.explanation}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="secondary" onClick={() => go(-1)}>◀ Anterior</Button>
            <Button onClick={() => go(1)}>Próximo ▶</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
