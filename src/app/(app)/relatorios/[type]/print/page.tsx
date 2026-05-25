import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber, kgToArrobas } from "@/lib/utils";

interface Props {
  params: Promise<{ type: string }>;
}

function PrintButton() {
  return (
    <button
      style={{
        padding: "6px 16px",
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 14,
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={"window.print()" as any}
    >
      Imprimir
    </button>
  );
}

export default async function PrintPage({ params }: Props) {
  const { type } = await params;
  const { tenant } = await requireTenant();

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");

  const printStyles = `
    body { font-family: Arial, sans-serif; margin: 0; padding: 16px; color: #111; }
    h1 { font-size: 20px; margin: 0 0 4px 0; }
    h2 { font-size: 15px; margin: 16px 0 8px 0; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    p { margin: 2px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th { background: #f0fdf4; text-align: left; padding: 6px 8px; border: 1px solid #d1fae5; font-size: 11px; font-weight: 600; }
    td { padding: 5px 8px; border: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .logo { display: flex; align-items: center; gap: 8px; }
    .logo-box { width: 36px; height: 36px; background: #16a34a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: bold; }
    .meta { font-size: 12px; color: #555; text-align: right; }
    .summary-cards { display: flex; gap: 12px; margin-bottom: 16px; }
    .summary-card { flex: 1; border: 1px solid #d1fae5; border-radius: 6px; padding: 10px 14px; background: #f0fdf4; }
    .summary-card .label { font-size: 11px; color: #555; }
    .summary-card .value { font-size: 16px; font-weight: bold; }
    .green { color: #16a34a; }
    .red { color: #dc2626; }
    .no-print { }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
    @page { margin: 1cm; }
  `;

  if (type === "dre") {
    const [sales, costs] = await Promise.all([
      prisma.sale.findMany({
        where: { farm: { tenantId: tenant.id } },
        include: { farm: { select: { name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.cost.findMany({
        where: { farm: { tenantId: tenant.id }, status: { not: "CANCELED" } },
        select: { amount: true, type: true },
      }),
    ]);

    const totalRevenue = sales.reduce((s, sale) => s + Number(sale.netValue), 0);
    const totalFixed = costs.filter((c) => c.type === "FIXED").reduce((s, c) => s + Number(c.amount), 0);
    const totalVariable = costs.filter((c) => c.type === "VARIABLE").reduce((s, c) => s + Number(c.amount), 0);
    const totalCosts = totalFixed + totalVariable;
    const netResult = totalRevenue - totalCosts;

    return (
      <html lang="pt-BR">
        <head>
          <meta charSet="utf-8" />
          <title>DRE – {tenant.name}</title>
          <style>{printStyles}</style>
        </head>
        <body>
          <div className="header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="logo-box" style={{ width: 36, height: 36, background: "#16a34a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: "bold" }}>P</div>
              <div>
                <h1 style={{ fontSize: 20, margin: 0 }}>{tenant.name}</h1>
                <p style={{ margin: 0, fontSize: 12, color: "#555" }}>Demonstrativo de Resultado do Exercício (DRE)</p>
              </div>
            </div>
            <div className="meta" style={{ fontSize: 12, color: "#555", textAlign: "right" }}>
              <p>Emitido em: {dateStr}</p>
              <div className="no-print" style={{ marginTop: 4, display: "flex", gap: 6 }}>
                <button
                  style={{ padding: "4px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  onClick={() => history.back()}
                >
                  ← Voltar
                </button>
                <button
                  style={{ padding: "4px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  onClick={() => window.print()}
                >
                  Imprimir
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Receita Total (Vendas)", value: formatCurrency(totalRevenue), color: "#16a34a" },
              { label: "Custos Fixos", value: formatCurrency(totalFixed), color: "#dc2626" },
              { label: "Custos Variáveis", value: formatCurrency(totalVariable), color: "#dc2626" },
              { label: "Resultado Líquido", value: formatCurrency(netResult), color: netResult >= 0 ? "#16a34a" : "#dc2626" },
            ].map((card) => (
              <div key={card.label} style={{ flex: 1, border: "1px solid #d1fae5", borderRadius: 6, padding: "10px 14px", background: "#f0fdf4" }}>
                <div style={{ fontSize: 11, color: "#555" }}>{card.label}</div>
                <div style={{ fontSize: 16, fontWeight: "bold", color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 15, margin: "16px 0 8px 0", borderBottom: "1px solid #ccc", paddingBottom: 4 }}>Vendas</h2>
          <table>
            <thead>
              <tr>
                <th>Comprador</th>
                <th>Fazenda</th>
                <th>Data</th>
                <th style={{ textAlign: "right" }}>Qtd</th>
                <th style={{ textAlign: "right" }}>Arrobas</th>
                <th style={{ textAlign: "right" }}>Receita Líquida</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 16, color: "#888" }}>Nenhuma venda registrada.</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.customerName}</td>
                  <td>{sale.farm.name}</td>
                  <td>{new Date(sale.date).toLocaleDateString("pt-BR")}</td>
                  <td style={{ textAlign: "right" }}>{sale.quantity}</td>
                  <td style={{ textAlign: "right" }}>
                    {sale.totalWeight ? `${formatNumber(kgToArrobas(Number(sale.totalWeight)), 1)} @` : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(Number(sale.netValue))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <script dangerouslySetInnerHTML={{
            __html: `
              document.querySelectorAll('button').forEach(function(btn) {
                btn.addEventListener('click', function() {
                  var text = btn.textContent.trim();
                  if (text === 'Imprimir') { window.print(); }
                  else if (text === '← Voltar') { history.back(); }
                });
              });
            `
          }} />
        </body>
      </html>
    );
  }

  if (type === "lotes") {
    const lots = await prisma.cattleLot.findMany({
      where: { farm: { tenantId: tenant.id } },
      include: {
        farm: { select: { name: true } },
        costs: { select: { amount: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const phaseLabels: Record<string, string> = {
      CRIA: "Cria",
      RECRIA: "Recria",
      ENGORDA: "Engorda",
      TERMINACAO: "Terminação",
      CONFINAMENTO: "Confinamento",
    };
    const statusLabels: Record<string, string> = {
      ACTIVE: "Ativo",
      SOLD: "Vendido",
      CLOSED: "Fechado",
      CANCELED: "Cancelado",
    };

    return (
      <html lang="pt-BR">
        <head>
          <meta charSet="utf-8" />
          <title>Relatório de Lotes – {tenant.name}</title>
          <style>{printStyles}</style>
        </head>
        <body>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, background: "#16a34a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: "bold" }}>P</div>
              <div>
                <h1 style={{ fontSize: 20, margin: 0 }}>{tenant.name}</h1>
                <p style={{ margin: 0, fontSize: 12, color: "#555" }}>Relatório de Lotes</p>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#555", textAlign: "right" }}>
              <p>Emitido em: {dateStr}</p>
              <div className="no-print" style={{ marginTop: 4, display: "flex", gap: 6 }}>
                <button
                  style={{ padding: "4px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  onClick={() => history.back()}
                >
                  ← Voltar
                </button>
                <button
                  style={{ padding: "4px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  onClick={() => window.print()}
                >
                  Imprimir
                </button>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fazenda</th>
                <th>Fase</th>
                <th style={{ textAlign: "right" }}>Qtd Atual</th>
                <th style={{ textAlign: "right" }}>Peso Médio (kg)</th>
                <th style={{ textAlign: "right" }}>Custo Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lots.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 16, color: "#888" }}>Nenhum lote cadastrado.</td></tr>
              ) : lots.map((lot) => {
                const totalCost = lot.costs.reduce((s, c) => s + Number(c.amount), 0);
                return (
                  <tr key={lot.id}>
                    <td style={{ fontWeight: "bold" }}>{lot.code}</td>
                    <td>{lot.farm.name}</td>
                    <td>{phaseLabels[lot.phase] ?? lot.phase}</td>
                    <td style={{ textAlign: "right" }}>{lot.currentQuantity}</td>
                    <td style={{ textAlign: "right" }}>
                      {lot.currentAvgWeight ? `${formatNumber(Number(lot.currentAvgWeight))} kg` : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(totalCost)}</td>
                    <td>{statusLabels[lot.status] ?? lot.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <script dangerouslySetInnerHTML={{
            __html: `
              document.querySelectorAll('button').forEach(function(btn) {
                btn.addEventListener('click', function() {
                  var text = btn.textContent.trim();
                  if (text === 'Imprimir') { window.print(); }
                  else if (text === '← Voltar') { history.back(); }
                });
              });
            `
          }} />
        </body>
      </html>
    );
  }

  if (type === "animais") {
    const animals = await prisma.animal.findMany({
      where: { farm: { tenantId: tenant.id }, status: "ACTIVE" },
      include: {
        farm: { select: { name: true } },
        lot: { select: { code: true } },
      },
      orderBy: [{ farm: { name: "asc" } }, { tag: "asc" }],
    });

    const categoryLabels: Record<string, string> = {
      BEZERRO: "Bezerro",
      BEZERRA: "Bezerra",
      GARROTE: "Garrote",
      NOVILHA: "Novilha",
      NOVILHO: "Novilho",
      VACA: "Vaca",
      BOI: "Boi",
      TOURO: "Touro",
    };

    return (
      <html lang="pt-BR">
        <head>
          <meta charSet="utf-8" />
          <title>Relatório de Animais – {tenant.name}</title>
          <style>{printStyles}</style>
        </head>
        <body>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, background: "#16a34a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: "bold" }}>P</div>
              <div>
                <h1 style={{ fontSize: 20, margin: 0 }}>{tenant.name}</h1>
                <p style={{ margin: 0, fontSize: 12, color: "#555" }}>Relatório de Animais Ativos</p>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#555", textAlign: "right" }}>
              <p>Emitido em: {dateStr} · Total: {animals.length} animais</p>
              <div className="no-print" style={{ marginTop: 4, display: "flex", gap: 6 }}>
                <button
                  style={{ padding: "4px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  onClick={() => history.back()}
                >
                  ← Voltar
                </button>
                <button
                  style={{ padding: "4px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  onClick={() => window.print()}
                >
                  Imprimir
                </button>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Brinco</th>
                <th>Categoria</th>
                <th>Raça</th>
                <th>Fazenda</th>
                <th>Lote</th>
                <th style={{ textAlign: "right" }}>Peso Atual (kg)</th>
                <th style={{ textAlign: "right" }}>Custo Compra</th>
              </tr>
            </thead>
            <tbody>
              {animals.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 16, color: "#888" }}>Nenhum animal ativo.</td></tr>
              ) : animals.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: "bold" }}>{a.tag ?? "—"}</td>
                  <td>{categoryLabels[a.category] ?? a.category}</td>
                  <td>{a.breed ?? "—"}</td>
                  <td>{a.farm.name}</td>
                  <td>{a.lot?.code ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    {a.currentWeight ? `${formatNumber(Number(a.currentWeight))} kg` : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {a.purchaseCost ? formatCurrency(Number(a.purchaseCost)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <script dangerouslySetInnerHTML={{
            __html: `
              document.querySelectorAll('button').forEach(function(btn) {
                btn.addEventListener('click', function() {
                  var text = btn.textContent.trim();
                  if (text === 'Imprimir') { window.print(); }
                  else if (text === '← Voltar') { history.back(); }
                });
              });
            `
          }} />
        </body>
      </html>
    );
  }

  // Fallback for unknown type
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <title>Relatório – {tenant.name}</title>
        <style>{printStyles}</style>
      </head>
      <body>
        <p>Tipo de relatório não encontrado: {type}</p>
        <button
          style={{ padding: "4px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
          onClick={() => history.back()}
        >
          ← Voltar
        </button>
        <script dangerouslySetInnerHTML={{
          __html: `document.querySelector('button').addEventListener('click', function() { history.back(); });`
        }} />
      </body>
    </html>
  );
}
