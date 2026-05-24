using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// ── Configuração do CORS (Vital para o React conseguir conectar) ──
// Subsitua o bloco antigo do CORS por este (linha ~11):
builder.Services.AddCors(options =>
{
    options.AddPolicy("RotaCertaPolicy", policy =>
    {
        policy.AllowAnyOrigin() // Permite qualquer origem local para evitar travas no desenvolvimento
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("RotaCertaPolicy");

// ── Banco de Dados Temporário (Mock de Telemetria Dinâmica) ──
var listaAlertas = new List<Alerta>
{
    new Alerta("1", "ABC-1234", "Carlos Silva", DateTime.UtcNow.AddMinutes(-2).ToString("o"), "Velocidade acima do limite permitido na rodovia SP-75.", "Critico"),
    new Alerta("2", "XYZ-5678", "Marcos Oliveira", DateTime.UtcNow.AddMinutes(-5).ToString("o"), "Frenagem brusca detectada próxima a cruzamento urbano.", "Aviso"),
    new Alerta("3", "MNO-9012", "Ana Costa", DateTime.UtcNow.AddMinutes(-12).ToString("o"), "Início de jornada de trabalho registrado no sistema.", "Info"),
    new Alerta("4", "KJH-4321", "Roberto Souzza", DateTime.UtcNow.AddMinutes(-15).ToString("o"), "Desvio de rota padrão não autorizado pelo operador.", "Aviso"),
    new Alerta("5", "QWE-8899", "Bruno Lima", DateTime.UtcNow.AddMinutes(-22).ToString("o"), "Temperatura do motor atingiu limite crítico de alerta (105°C).", "Critico")
};

// ── Endpoints da API ──

// Endpoint 1: Retorna a lista completa de alertas ativos
app.MapGet("/api/alertas", () => 
{
    return Results.Ok(listaAlertas.OrderByDescending(a => a.DataGeracao));
});

// Endpoint 2: AJUSTADO para bater com o seu Front-end!
app.MapGet("/api/alertas/resumo", () =>
{
    var resumo = new Resumo(
        Total: listaAlertas.Count,
        Criticos: listaAlertas.Count(a => a.Tipo == "Critico"),
        Avisos: listaAlertas.Count(a => a.Tipo == "Aviso"),
        Infos: listaAlertas.Count(a => a.Tipo == "Info")
    );
    return Results.Ok(resumo);
});

// Endpoint Bônus: Simula a chegada de uma nova ocorrência via POST
app.MapPost("/api/alertas/simular", (NovaOcorrencia input) =>
{
    var novoAlerta = new Alerta(
        Guid.NewGuid().ToString(),
        input.Placa,
        input.Motorista,
        DateTime.UtcNow.ToString("o"),
        input.Mensagem,
        input.Tipo
    );
    listaAlertas.Insert(0, novoAlerta);
    return Results.Created($"/api/alertas/{novoAlerta.Id}", novoAlerta);
});

// Substitua a ÚLTIMA LINHA do arquivo por esta:
app.Run("http://127.0.0.1:5000"); // <-- Força o C# a escutar diretamente no IPv4 numérico

// ── Modelos de Dados (Records) ──
public record Alerta(string Id, string PlacaVeiculo, string Motorista, string DataGeracao, string Mensagem, string Tipo);
public record Resumo(int Total, int Criticos, int Avisos, int Infos);
public record NovaOcorrencia(string Placa, string Motorista, string Mensagem, string Tipo);