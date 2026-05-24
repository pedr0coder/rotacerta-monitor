# 🚛 RotaCerta Monitor — Torre de Controle & Auditoria de Telemetria

Este projeto é um dashboard tático de nível corporativo desenvolvido para atuar como a "Torre de Controle" do ecossistema RotaCerta. O objetivo principal do sistema é auditar e processar, em tempo real, pacotes de telemetria enviados por frotas de transporte, permitindo a identificação instantânea de desvios de rota, excessos de velocidade e incidentes críticos de segurança.

---

### 📊 Stack Tecnológica & Status do Sistema

![Status da Aplicação](https://img.shields.io/badge/Status-Pronto_para_Produ%C3%A7%C3%A3o-32D74B?style=for-the-badge)
![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Material UI](https://img.shields.io/badge/MUI-5.x-007FFF?style=for-the-badge&logo=mui&logoColor=white)

---

## 💡 Decisões de Engenharia & Visão de Negócios

Como engenheiro de software, o projeto foi arquitetado com foco em **escalabilidade, isolamento de processos e resiliência de rede**, seguindo padrões rigorosos exigidos por grandes empresas de logística (*SaaS Enterprise*):

* **Arquitetura Multi-Repo (Desacoplada):** O monitoramento em tempo real exige alta frequência de requisições (*polling* constante de 5 segundos). Separar o motor de telemetria do sistema administrativo central garante que o tráfego pesado de pacotes de dados não gere overhead ou trave o faturamento, cadastro de motoristas ou o planejamento de rotas da empresa.
* **Mitigação de Latência Local (IPv4 Direto):** Para contornar problemas comuns de resolução de DNS local (atrasos ou timeouts causados pelo loopback IPv6), a comunicação do Axios foi travada diretamente no endereço IP numérico estável `127.0.0.1:5000`.
* **Tipagem Estrita com TypeScript:** Toda a camada de consumo da API foi blindada com contratos de interfaces bem definidos. Os estilos customizados utilizam estritamente as propriedades do ecossistema `sx` do Material UI, evitando re-renderizações desnecessárias e garantindo performance à interface.

---

## 📂 Topologia do Repositório

| Camada | Diretório | Papel no Ecossistema | Principais Tecnologias |
| :--- | :--- | :--- | :--- |
| **Back-end** | `/backend` | Processamento de eventos de sensores, ordenação LINQ e API REST leve. | C# \| .NET 8 Minimal APIs |
| **Front-end** | `/frontend` | Consumo assíncrono, gerenciamento de estado e interface do operador. | React 18 \| TypeScript |

```text
rotacerta-monitor/
├── backend/                  # API Engine (.NET 8)
│   ├── Program.cs            # Handshake IPv4, Pipeline de CORS e Records estruturados
│   └── RotaCerta.MonitorAPI.csproj
├── frontend/                 # Client Web (React + TS)
│   ├── src/
│   │   ├── pages/            # Telas principais (MonitorDashboard.tsx)
│   │   ├── services/         # Instância e interceptadores do Axios (api.ts)
│   │   └── types/            # Contratos de tipagem de dados da telemetria
│   ├── package.json          # Manifesto de dependências e scripts Node
│   └── index.css             # Reset global de layout e largura (100% Viewport)
└── README.md                 # Documentação técnica de engenharia
```

---

## 🚀 Guia de Inicialização Unificado

<details>
<summary><b>💻 Clique aqui para expandir as instruções de execução passo a passo</b></summary>

### 📋 Requisitos Prévios do Ambiente
Antes de rodar os comandos abaixo, certifique-se de possuir instalado na máquina:
* **SDK do .NET 8**
* **Node.js LTS** estável

---

### 🎛️ Passo 1: Inicializando o Back-end (C#)

Abra o terminal na pasta raiz do repositório, navegue até o diretório do servidor e execute a API:
```bash
cd backend
dotnet run
```
O servidor compilará e ficará ativo no protocolo IPv4 dedicado:
👉 URL Base: `http://127.0.0.1:5000`

---

### ⚡ Passo 2: Inicializando o Front-end (React)

Abra um **segundo terminal paralelo** (deixando o terminal do C# ativo), instale os pacotes limpos e dispare o servidor de desenvolvimento do Vite:
```bash
cd frontend
npm install
npm run dev
```
A interface tática compilará em milissegundos e estará disponível no navegador através do endereço:
👉 URL da Interface: `http://localhost:5173/`

</details>

---

## 📈 Critérios Avançados de UI/UX (Design Centrado no Humano)

* **Design System Limpo (Zero Emojis no App):** Para afastar o visual amador comum em protótipos de IA, todos os emojis de interface foram substituídos por vetores **SVG geométricos puros** com espessura constante de `2px`. Isso garante nitidez perfeita e fidelidade visual idêntica, independentemente se o operador está acessando o sistema via Windows, Mac, Linux ou monitores industriais de baixa resolução.
* **Mapeamento Tático Abstrato:** O quadrante direito elimina o peso de carregamento de mapas de terceiros desnecessários para uma primeira triagem, implementando um **Radar de Varredura por Satélite** de alta performance construído nativamente em CSS puro (`conic-gradient`). Ele exibe coordenadas reais da operação logística na rodovia **SP-75** (Sorocaba/SP) e renderiza logs de transmissão dinâmicos atrelados ao status da API.
* **Tratamento de Falhas Visual:** O front-end monitora ativamente a saúde do back-end. Caso o link seja interrompido, o dashboard não quebra a aplicação: ele exibe um banner sóbrio de reconexão automática, altera os indicadores de rede para o modo offline e congela as últimas coordenadas recebidas com segurança.
```