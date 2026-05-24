// ============================================================
//  RotaCerta Monitor — Painel Principal de Telemetria (Versão Enterprise)
//  Salvar em: src/pages/MonitorDashboard.tsx
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';

import Box          from '@mui/material/Box';
import Card         from '@mui/material/Card';
import CardContent  from '@mui/material/CardContent';
import Chip         from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider      from '@mui/material/Divider';
import Grid         from '@mui/material/Grid';
import Skeleton     from '@mui/material/Skeleton';
import Typography   from '@mui/material/Typography';

import type { Alerta, EstadoPainel } from '../types/monitor';
import { TIPO_META } from '../types/monitor';
import { fetchAlertas, fetchResumo } from '../services/api';

const POLLING_MS = 5_000;

// ── Animações Suaves de Interface ────────────────────────────────────────────
const KEYFRAMES_CSS = `
  @keyframes rcPulseGlow {
    0%   { box-shadow: 0 0 8px 1px rgba(255,45,85,0.12), inset 0 0 0 1px rgba(255,45,85,0.12); }
    50%  { box-shadow: 0 0 18px 3px rgba(255,45,85,0.35), inset 0 0 0 1px rgba(255,45,85,0.35); }
    100% { box-shadow: 0 0 8px 1px rgba(255,45,85,0.12), inset 0 0 0 1px rgba(255,45,85,0.12); }
  }
  @keyframes rcFadeIn {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes rcBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  @keyframes rcRadarSweep {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

function fmtHora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch { return '--:--:--'; }
}

function fmtSync(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ── Ícones Vetoriais SVG Puros (Arquitetura Sóbria e Humana) ──────────────────
const SvgCaminhao = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const SvgSinalConectado = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#32D74B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0" />
  </svg>
);

const SvgSinalDesconectado = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF2D55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 13M5 13a10.94 10.94 0 0 1 5.83-2.84M12 20h.01" />
  </svg>
);

const SvgAlvo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
  </svg>
);

// Ícones Técnicos para os Cards de KPI
const SvgRegistros = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="21" y1="18" x2="3" y2="18" />
  </svg>
);

const SvgCritico = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SvgAviso = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SvgInfo = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);

// ── Sub-componente: Card de KPI Refatorado (Sem o glowColor obsoleto) ─────────
interface KpiProps {
  titulo: string;
  valor: number | null;
  accentColor: string;
  critical?: boolean;
  icon: React.ReactNode;
}

function KpiItem({ titulo, valor, accentColor, critical = false, icon }: KpiProps) {
  return (
    <Card
      elevation={0}
      sx={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.002))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderTop: `2px solid ${accentColor}`,
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        cursor: 'default',
        animation: critical ? 'rcPulseGlow 3s ease-in-out infinite' : 'none',
        '&:hover': { transform: 'translateY(-1px)', borderColor: 'rgba(255,255,255,0.08)' }
      }}
    >
      <CardContent sx={{ p: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
            {titulo}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>

        {valor === null ? (
          <Skeleton variant="text" width="40%" height={44} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }} />
        ) : (
          <Typography sx={{ fontSize: '2.1rem', fontWeight: 700, lineHeight: 1, color: '#FFFFFF', fontFamily: '"Roboto Mono", monospace' }}>
            {String(valor).padStart(2, '0')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ── Sub-componente: Linha do Feed de Alertas ─────────────────────────────────
function LinhaAlerta({ alerta }: { alerta: Alerta }) {
  const meta = TIPO_META[alerta.tipo];

  return (
    <Box sx={{
      background: 'rgba(255,255,255,0.008)',
      border: '1px solid rgba(255,255,255,0.03)',
      borderLeft: `3px solid ${meta.color}`,
      borderRadius: '4px',
      p: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      animation: 'rcFadeIn 0.2s ease both',
      transition: 'background-color 0.1s ease',
      '&:hover': { background: 'rgba(255,255,255,0.015)' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, mt: '3px' }}>
        {alerta.tipo === 'Critico' && <SvgCritico color={meta.color} />}
        {alerta.tipo === 'Aviso' && <SvgAviso color={meta.color} />}
        {alerta.tipo === 'Info' && <SvgInfo color={meta.color} />}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', px: '8px', py: '1px', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>
            {alerta.placaVeiculo}
          </Box>

          <Typography sx={{ fontSize: '0.80rem', fontWeight: 500, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
            {alerta.motorista}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Typography sx={{ fontSize: '0.72rem', fontFamily: '"Roboto Mono", monospace', color: 'rgba(255,255,255,0.25)' }}>
            {fmtHora(alerta.dataGeracao)}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
          {alerta.mensagem}
        </Typography>
      </Box>

      <Chip label={meta.label.toUpperCase()} size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.5px', bgcolor: `${meta.color}10`, color: meta.color, border: `1px solid ${meta.color}20`, borderRadius: '3px', flexShrink: 0, mt: '2px' }} />
    </Box>
  );
}

function Skeletons() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />
      ))}
    </>
  );
}

// ── Componente Principal ─────────────────────────────────────────────────────
export default function MonitorDashboard() {
  const [estado, setEstado] = useState<EstadoPainel>({
    alertas: [],
    resumo: null,
    carregando: true,
    erro: null,
    ultimaAtualizacao: null,
  });

  const mounted = useRef(true);

  const carregar = useCallback(async () => {
    try {
      const [alertas, resumo] = await Promise.all([fetchAlertas(), fetchResumo()]);
      if (!mounted.current) return;
      setEstado((p) => ({
        ...p, alertas, resumo,
        carregando: false, erro: null,
        ultimaAtualizacao: new Date(),
      }));
    } catch (e) {
      if (!mounted.current) return;
      const msg = e instanceof Error ? e.message : 'Falha na comunicação com o servidor.';
      setEstado((p) => ({ ...p, carregando: false, erro: msg, ultimaAtualizacao: new Date() }));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    carregar();
    const id = setInterval(carregar, POLLING_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [carregar]);

  const { alertas, resumo, carregando, erro, ultimaAtualizacao } = estado;
  const online      = !erro;
  const primeiraVez = carregando && ultimaAtualizacao === null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />

      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#090E17',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0,200,255,0.02) 0%, transparent 45%)',
        p: { xs: '20px 16px 40px', md: '24px 32px 48px' },
      }}>

        {/* ── Cabeçalho Clean ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '6px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SvgCaminhao />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.3px', color: '#FFFFFF', lineHeight: 1.2 }}>
                RotaCerta
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, textTransform: 'uppercase' }}>
                Painel Integrado de Telemetria
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {primeiraVez && <CircularProgress size={10} sx={{ color: '#00C8FF' }} />}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {online ? <SvgSinalConectado /> : <SvgSinalDesconectado />}
              <Typography sx={{ fontSize: '0.70rem', fontWeight: 600, color: online ? '#32D74B' : '#FF2D55', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {online ? 'Servidor Ativo' : 'Link Interrompido'}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'right', pl: 2, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px' }}>ÚLTIMA TRANSMISSÃO</Typography>
              <Typography sx={{ fontSize: '0.70rem', fontFamily: '"Roboto Mono", monospace', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {fmtSync(ultimaAtualizacao)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Banner de Erro Sóbrio ── */}
        {erro && (
          <Box sx={{ mb: 3, p: '10px 14px', borderRadius: '4px', bgcolor: 'rgba(255,45,85,0.03)', border: '1px solid rgba(255,45,85,0.15)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#FF2D55', animation: 'rcBlink 1s infinite' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#FF2D55', fontWeight: 500 }}>
              Falha de Conectividade — {erro}. Nova tentativa em {POLLING_MS / 1000}s.
            </Typography>
          </Box>
        )}

        {/* ── Grid Estrutural de Produção ── */}
        <Grid container spacing={3}>
          
          {/* LADO ESQUERDO: INFRAESTRUTURA DE DADOS (72% da Largura) */}
          <Grid size={{ xs: 12, lg: 8.5 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiItem titulo="Registros Totais" valor={resumo?.total ?? null} accentColor="#0090FF" icon={<SvgRegistros color="#0090FF" />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiItem titulo="Eventos Críticos" valor={resumo?.criticos ?? null} accentColor={TIPO_META.Critico.color} critical icon={<SvgCritico color={TIPO_META.Critico.color} />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiItem titulo="Avisos de Frota" valor={resumo?.avisos ?? null} accentColor={TIPO_META.Aviso.color} icon={<SvgAviso color={TIPO_META.Aviso.color} />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiItem titulo="Notificações" valor={resumo?.infos ?? null} accentColor={TIPO_META.Info.color} icon={<SvgInfo color={TIPO_META.Info.color} />} />
              </Grid>
            </Grid>

            {/* Container do Feed Principal */}
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.005)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', p: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 2, height: 12, bgcolor: '#00C8FF' }} />
                  <Typography sx={{ fontSize: '0.70rem', fontWeight: 600, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
                    Histórico de Eventos Recentes
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#00C8FF', animation: 'rcBlink 2s infinite' }} />
                  <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>FREQUÊNCIA: {POLLING_MS / 1000}s</Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)', mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', pr: '4px', '&::-webkit-scrollbar': { width: '2px' }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                {primeiraVez && <Skeletons />}
                {!primeiraVez && !erro && alertas.length === 0 && (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.80rem' }}>Aguardando atualizações de telemetria da frota...</Typography>
                  </Box>
                )}
                {alertas.map((a) => <LinhaAlerta key={a.id} alerta={a} />)}
              </Box>
            </Box>
          </Grid>

          {/* LADO DIREITO: MONITOR GEOGRÁFICO MINIMALISTA (28% da Largura) */}
          <Grid size={{ xs: 12, lg: 3.5 }}>
            <Box sx={{
              height: '100%',
              bgcolor: 'rgba(255,255,255,0.005)',
              border: '1px solid rgba(255,255,255,0.03)',
              borderRadius: '6px',
              p: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SvgAlvo />
                <Box>
                  <Typography sx={{ fontSize: '0.70rem', fontWeight: 600, letterSpacing: '0.5px', color: '#FFFFFF', textTransform: 'uppercase' }}>
                    Mapeamento Geográfico
                  </Typography>
                  <Typography sx={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>
                    DIRETRIZES E COORDENADAS ATIVAS
                  </Typography>
                </Box>
              </Box>

              {/* Radar Técnico Sóbrio */}
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <Box sx={{
                  width: 150, height: 150,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.03)',
                  position: 'relative',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.005) 0%, transparent 80%)',
                  '&::before': {
                    content: '""', position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px',
                    borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.02)'
                  },
                  '&::after': {
                    content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, rgba(0,200,255,0.08) 0deg, transparent 70deg)',
                    animation: 'rcRadarSweep 6s linear infinite',
                    transformOrigin: 'center'
                  }
                }}>
                  <Box sx={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', bgcolor: 'rgba(255,255,255,0.02)' }} />
                  <Box sx={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: '1px', bgcolor: 'rgba(255,255,255,0.02)' }} />
                  
                  {/* Indicadores sutis de posicionamento */}
                  <Box sx={{ position: 'absolute', top: '38%', left: '62%', width: 3, height: 3, bgcolor: '#FF2D55', borderRadius: '50%' }} />
                  <Box sx={{ position: 'absolute', top: '68%', left: '30%', width: 3, height: 3, bgcolor: '#32D74B', borderRadius: '50%' }} />
                </Box>
              </Box>

              {/* Console Técnico Limpo */}
              <Box sx={{ bgcolor: '#070B14', borderRadius: '4px', p: '12px', border: '1px solid rgba(255,255,255,0.02)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600, mb: 0.3 }}>CONEXÃO LOCAL</Typography>
                  <Typography sx={{ fontSize: '0.68rem', fontFamily: '"Roboto Mono", monospace', color: '#32D74B', fontWeight: 500 }}>
                    127.0.0.1:5000 (IPv4)
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600, mb: 0.3 }}>ÁREA DE COBERTURA</Typography>
                  <Typography sx={{ fontSize: '0.68rem', fontFamily: '"Roboto Mono", monospace', color: 'rgba(255,255,255,0.7)' }}>
                    Macro-região Sorocaba (SP-75)
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600, mb: 0.3 }}>GEOLOCALIZAÇÃO BASE</Typography>
                  <Typography sx={{ fontSize: '0.68rem', fontFamily: '"Roboto Mono", monospace', color: 'rgba(255,255,255,0.45)' }}>
                    LAT -23.5015 | LON -47.4521
                  </Typography>
                </Box>
              </Box>

              {/* Rodapé Interno */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid rgba(255,255,255,0.02)' }}>
                <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
                  RotaCerta Core v1.0
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 1.5, bgcolor: '#00C8FF', borderRadius: '1px' }} />
                  <Box sx={{ width: 6, height: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '1px' }} />
                </Box>
              </Box>
            </Box>
          </Grid>

        </Grid>
      </Box>
    </>
  );
}