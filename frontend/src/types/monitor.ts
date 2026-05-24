// ============================================================
//  RotaCerta Monitor — Tipagens Centrais
//  Salvar em: src/types/monitor.ts
// ============================================================

// ── Tipo do alerta (sem enum — compatível com erasableSyntaxOnly) ──────────
export type TipoAlerta = 'Critico' | 'Aviso' | 'Info';

// ── Mapeamento de rótulos e paleta por tipo ─────────────────────────────────
export const TIPO_META = {
  Critico: {
    label: 'CRÍTICO',
    color: '#FF2D55',
    glow: 'rgba(255, 45, 85, 0.45)',
    bg: 'rgba(255, 45, 85, 0.08)',
  },
  Aviso: {
    label: 'AVISO',
    color: '#FF9F0A',
    glow: 'rgba(255, 159, 10, 0.35)',
    bg: 'rgba(255, 159, 10, 0.08)',
  },
  Info: {
    label: 'INFO',
    color: '#32D74B',
    glow: 'rgba(50, 215, 75, 0.30)',
    bg: 'rgba(50, 215, 75, 0.07)',
  },
} as const;

// ── Estrutura principal do Alerta (espelho do backend C#) ───────────────────
export interface Alerta {
  id: string;
  placaVeiculo: string;
  motorista: string;
  mensagem: string;
  tipo: TipoAlerta;
  dataGeracao: string; // ISO 8601 string
}

// ── DTO do endpoint /resumo ─────────────────────────────────────────────────
export interface ResumoAlertas {
  total: number;
  criticos: number;
  avisos: number;
  infos: number;
}

// ── Estado agregado do painel ───────────────────────────────────────────────
export interface EstadoPainel {
  alertas: Alerta[];
  resumo: ResumoAlertas | null;
  carregando: boolean;
  erro: string | null;
  ultimaAtualizacao: Date | null;
}
