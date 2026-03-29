import { useState } from 'react';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { companies } from '../data/companies';

const SLIDES = [HeroSlide, MethodSlide, PipelineSlide];

export default function Presentation({ onEnterPlatform }) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const Slide = SLIDES[slide];

  return (
    <div className="min-h-screen bg-enter-black flex flex-col">
      {/* Top banner — Enter style gold bar */}
      <div className="bg-enter-gold flex items-center justify-between px-8 py-3">
        <span className="font-mono text-label uppercase text-enter-black">
          Case Growth · Summer 2026
        </span>
        <div className="flex items-center gap-4">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === slide ? 'bg-enter-black w-8' : i < slide ? 'bg-enter-black/40' : 'bg-enter-black/20'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={onEnterPlatform}
          className="font-mono text-label uppercase text-enter-black/60 hover:text-enter-black transition-colors cursor-pointer"
        >
          Pular →
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center" key={slide}>
        <div className="w-full max-w-[1200px] px-12 animate-fadeIn">
          <Slide onEnter={onEnterPlatform} />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-12 py-6">
        <button
          onClick={() => slide > 0 && setSlide(slide - 1)}
          className={`font-mono text-label uppercase flex items-center gap-2 cursor-pointer transition-colors ${
            slide === 0 ? 'text-enter-gray-800' : 'text-enter-gray-500 hover:text-enter-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <span className="font-mono text-caption text-enter-gray-600">
          {slide + 1} / {SLIDES.length}
        </span>

        {isLast ? (
          <button
            onClick={onEnterPlatform}
            className="font-mono text-label uppercase flex items-center gap-2 border border-enter-white text-enter-white px-8 py-4 rounded-enter hover:bg-enter-white hover:text-enter-black transition-colors cursor-pointer"
          >
            Entrar na Plataforma <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setSlide(slide + 1)}
            className="font-mono text-label uppercase flex items-center gap-2 text-enter-gray-500 hover:text-enter-white transition-colors cursor-pointer"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── SLIDE 1: HERO ───
function HeroSlide() {
  const qualified = companies.filter(c => c.score.verdict === 'QUALIFIED').length;

  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-12">
        Stefano Gebara
      </p>

      <h1 className="text-display text-enter-white mb-4">
        Qualificação Trabalhista
      </h1>
      <h2 className="text-display text-enter-gold">
        com Sales Intelligence
      </h2>

      <p className="text-body-lg text-enter-gray-400 mt-12 max-w-2xl">
        Plataforma que identifica, qualifica e prioriza automaticamente
        quais empresas da base Enter têm volume suficiente de contencioso
        trabalhista para justificar contratos de US$500k+/ano.
      </p>

      <div className="flex items-center gap-16 mt-16">
        <Stat value={companies.length} label="empresas" />
        <Stat value={qualified} label="qualificadas" />
        <Stat value="R$50.6B" label="pagos em 2025" mono />
        <Stat value="2.4M" label="casos/ano" mono />
      </div>
    </div>
  );
}

// ─── SLIDE 2: METHODOLOGY ───
function MethodSlide() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-12">
        Metodologia
      </p>

      <h2 className="text-title-lg text-enter-white mb-16">
        Score composto em<br />
        <span className="text-enter-gold">três dimensões verificáveis</span>
      </h2>

      <div className="grid grid-cols-3 gap-16">
        <Dimension
          pct="30%" title="Volume" color="border-blue-500"
          lines={['Funcionários × taxa de litígio', 'Calibrado com TST Ranking', 'Bradesco: 88% accuracy']}
        />
        <Dimension
          pct="40%" title="Complexidade" color="border-enter-gold"
          lines={['Presença estadual', 'Disputa sindical (sim/não)', 'Terceirização · Capital aberto', 'Complexidade do setor']}
        />
        <Dimension
          pct="30%" title="Timing" color="border-orange-500"
          lines={['Layoffs recentes', 'M&A · Reestruturação', 'Privatização']}
        />
      </div>
    </div>
  );
}

// ─── SLIDE 3: PIPELINE ───
function PipelineSlide({ onEnter }) {
  return (
    <div className="text-center">
      <p className="font-mono text-label uppercase text-enter-gold mb-12">
        A Plataforma
      </p>

      <h2 className="text-title-lg text-enter-white mb-6">
        Pipeline automático de<br />
        <span className="text-enter-gold">Sales Intelligence</span>
      </h2>

      <p className="text-body-lg text-enter-gray-400 mb-16 max-w-xl mx-auto">
        Selecione qualquer empresa e o sistema executa o pipeline completo
        com pesquisa web em tempo real.
      </p>

      <div className="flex items-center justify-center gap-6 mb-16">
        {[
          { n: '01', label: 'Dashboard', sub: `${companies.length} empresas` },
          { n: '02', label: 'Qualificação', sub: 'Perplexity + web search' },
          { n: '03', label: 'Discovery', sub: '8 perguntas' },
          { n: '04', label: 'Pitch CFO', sub: '3 parágrafos' },
        ].map(({ n, label, sub }, i) => (
          <div key={n} className="flex items-center gap-6">
            <div className="text-left">
              <span className="font-mono text-caption text-enter-gray-600">{n}</span>
              <p className="text-title-sm text-enter-white">{label}</p>
              <p className="text-caption text-enter-gray-500 mt-1">{sub}</p>
            </div>
            {i < 3 && <ArrowRight className="w-5 h-5 text-enter-gray-700 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <button
        onClick={onEnter}
        className="font-mono text-label uppercase border border-enter-white text-enter-white px-12 py-5 rounded-enter hover:bg-enter-white hover:text-enter-black transition-colors cursor-pointer"
      >
        Entrar na Plataforma
      </button>
    </div>
  );
}

// ─── SHARED ───
function Stat({ value, label, mono }) {
  return (
    <div>
      <p className={`text-title-md text-enter-white ${mono ? 'font-mono' : ''}`}>{value}</p>
      <p className="text-caption text-enter-gray-500 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Dimension({ pct, title, color, lines }) {
  return (
    <div className={`border-t-2 ${color} pt-6`}>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-caption text-enter-gray-500">{pct}</span>
        <h3 className="text-title-sm text-enter-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {lines.map((l, i) => (
          <p key={i} className="text-body-lg text-enter-gray-400">{l}</p>
        ))}
      </div>
    </div>
  );
}
