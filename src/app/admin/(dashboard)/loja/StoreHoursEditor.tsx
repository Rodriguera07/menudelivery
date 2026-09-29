'use client';

import { useState } from 'react';
import { Icon, I } from '../pp-icons';
import { card, btnPrimary, SectionTitle } from '../ui';
import { Switch, useToast } from '../ui-client';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
// Segunda primeiro, como o lojista pensa a semana.
const ORDEM = [1, 2, 3, 4, 5, 6, 0];

type DayHours = { weekday: number; closed: boolean; openTime: string; closeTime: string };

const PRESETS: { label: string; aplicar: (d: DayHours) => DayHours }[] = [
  { label: 'Seg a Sex, 9h–18h', aplicar: (d) => ({ ...d, closed: d.weekday === 0 || d.weekday === 6, openTime: '09:00', closeTime: '18:00' }) },
  { label: 'Todos os dias, 11h–23h', aplicar: (d) => ({ ...d, closed: false, openTime: '11:00', closeTime: '23:00' }) },
  { label: 'Ter a Dom, 18h–23h', aplicar: (d) => ({ ...d, closed: d.weekday === 1, openTime: '18:00', closeTime: '23:00' }) },
];

export default function StoreHoursEditor({ initialHours }: { initialHours: DayHours[] }) {
  const [salvo, setSalvo] = useState(initialHours);
  const [hours, setHours] = useState(initialHours);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const alterado = JSON.stringify(hours) !== JSON.stringify(salvo);
  const hoje = new Date().toLocaleDateString('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' });
  const hojeIdx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(hoje);
  const invalido = (d: DayHours) => !d.closed && (!d.openTime || !d.closeTime || d.openTime === d.closeTime);

  function updateDay(weekday: number, patch: Partial<DayHours>) {
    setHours((prev) => prev.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)));
  }

  function copiarParaTodos(origem: DayHours) {
    setHours((prev) => prev.map((d) => (d.closed ? d : { ...d, openTime: origem.openTime, closeTime: origem.closeTime })));
    toast.show(`Horário de ${DIAS[origem.weekday].toLowerCase()} copiado para os dias abertos`);
  }

  async function save() {
    if (hours.some(invalido)) return toast.show('Confira os horários destacados.', 'erro');
    setLoading(true);
    try {
      const res = await fetch('/api/store/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hours),
      });
      if (!res.ok) return toast.show('Não foi possível salvar o horário.', 'erro');
      setSalvo(hours);
      toast.show('Horário salvo');
    } catch {
      toast.show('Falha de conexão. Tente novamente.', 'erro');
    } finally {
      setLoading(false);
    }
  }

  const abertos = hours.filter((d) => !d.closed).length;

  return (
    <section id="horarios" className={`${card} p-5 sm:p-6 flex flex-col gap-5 scroll-mt-16`}>
      <SectionTitle
        icon={I.relogio}
        tone="green"
        title="Horário de funcionamento"
        desc={`A loja abre e fecha sozinha nesses horários. ${abertos} de 7 dias abertos.`}
      />

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-[#6B6662] self-center mr-1">Atalhos:</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setHours((prev) => prev.map(p.aplicar))}
            className="h-8 px-3 rounded-full text-xs font-semibold bg-white border border-[#E4DFDA] text-[#3D3A37] hover:border-[#1D1B1A] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col divide-y divide-[#F0ECE8] -mx-2">
        {ORDEM.map((wd) => {
          const d = hours.find((h) => h.weekday === wd)!;
          const ruim = invalido(d);
          const virada = !d.closed && d.openTime && d.closeTime && d.closeTime < d.openTime;
          return (
            <li key={wd} className={`px-2 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 ${wd === hojeIdx ? 'bg-[#FBFAF8] rounded-xl' : ''}`}>
              <div className="w-32 flex items-center gap-3">
                <Switch
                  checked={!d.closed}
                  label={d.closed ? `Abrir na ${DIAS[wd]}` : `Fechar na ${DIAS[wd]}`}
                  onChange={(aberto) => updateDay(wd, { closed: !aberto })}
                  size="sm"
                />
                <span className="text-sm font-semibold">
                  {DIAS[wd]}
                  {wd === hojeIdx && <span className="block text-[11px] font-semibold text-[#177245]">hoje</span>}
                </span>
              </div>

              {d.closed ? (
                <span className="text-sm text-[#6B6662]">Fechado</span>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-[230px]">
                  <input
                    type="time"
                    aria-label={`Abre na ${DIAS[wd]}`}
                    className={`h-10 w-[112px] rounded-lg border px-2.5 pp-mono text-sm bg-white outline-none focus:border-[#1D1B1A] ${ruim ? 'border-[#E8A39C]' : 'border-[#E4DFDA]'}`}
                    value={d.openTime}
                    onChange={(e) => updateDay(wd, { openTime: e.target.value })}
                  />
                  <span className="text-[#6B6662] text-sm">até</span>
                  <input
                    type="time"
                    aria-label={`Fecha na ${DIAS[wd]}`}
                    className={`h-10 w-[112px] rounded-lg border px-2.5 pp-mono text-sm bg-white outline-none focus:border-[#1D1B1A] ${ruim ? 'border-[#E8A39C]' : 'border-[#E4DFDA]'}`}
                    value={d.closeTime}
                    onChange={(e) => updateDay(wd, { closeTime: e.target.value })}
                  />
                  {virada && <span className="text-[11px] font-semibold text-[#8A5A00] bg-[#FFF4D6] px-2 py-0.5 rounded-full">vira a noite</span>}
                  <button
                    type="button"
                    onClick={() => copiarParaTodos(d)}
                    className="ml-auto h-8 px-2.5 rounded-lg text-xs font-semibold text-[#5E5A57] hover:bg-[#F1EEEB] hover:text-[#1D1B1A] inline-flex items-center gap-1.5"
                    title="Usar este horário em todos os dias abertos"
                  >
                    <Icon d={I.copiar} size={13} /> Copiar p/ todos
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={loading || !alterado} className={btnPrimary}>
          {loading ? 'Salvando…' : alterado ? 'Salvar horário' : 'Horário salvo'}
        </button>
        {alterado && (
          <button type="button" onClick={() => setHours(salvo)} className="h-11 px-3 text-sm font-semibold text-[#5E5A57] hover:text-[#1D1B1A]">
            Desfazer
          </button>
        )}
      </div>
      {toast.node}
    </section>
  );
}
