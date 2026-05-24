// ============================================================
//  RotaCerta Monitor — Camada de Serviço HTTP
//  Salvar em: src/services/api.ts
// ============================================================

import axios from 'axios';
import type { Alerta, ResumoAlertas } from '../types/monitor';

// ── Instância Axios apontando para o backend C# .NET 10 ────────────────────
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // <-- Altere para o IP 127.0.0.1 e a porta 5000
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Interceptor: loga erros de rede no console para diagnóstico ─────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 'NETWORK';
    const url = error.config?.url ?? '';
    console.error(`[RotaCerta API] ${status} → ${url}`, error.message);
    return Promise.reject(error);
  }
);

// ── Busca os últimos 50 alertas (mais recente primeiro) ─────────────────────
export async function fetchAlertas(): Promise<Alerta[]> {
  const { data } = await apiClient.get<Alerta[]>('/alertas');
  return data;
}

// ── Busca o resumo consolidado de contagens ─────────────────────────────────
export async function fetchResumo(): Promise<ResumoAlertas> {
  const { data } = await apiClient.get<ResumoAlertas>('/alertas/resumo');
  return data;
}
