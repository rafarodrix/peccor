"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  importAnimals,
  importWeighings,
  importCosts,
  type AnimalImportRow,
  type WeighingImportRow,
  type CostImportRow,
} from "@/server/actions/import";

interface Farm {
  id: string;
  name: string;
}

interface Lot {
  id: string;
  code: string;
  farmId: string;
}

interface Props {
  farms: Farm[];
  lots: Lot[];
}

type TabType = "animais" | "pesagens" | "custos";

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(parseCSVLine);
  return { headers, rows };
}

type ImportResult = { success: boolean; count: number } | { error: string } | null;

export function ImportClient({ farms, lots }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("animais");

  // Animais state
  const [animaisFile, setAnimaisFile] = useState<File | null>(null);
  const [animaisPreview, setAnimaisPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [animaisFarmId, setAnimaisFarmId] = useState("");
  const [animaisResult, setAnimaisResult] = useState<ImportResult>(null);
  const [animaisLoading, setAnimaisLoading] = useState(false);
  const animaisInputRef = useRef<HTMLInputElement>(null);

  // Pesagens state
  const [pesagensFile, setPesagensFile] = useState<File | null>(null);
  const [pesagensPreview, setPesagensPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [pesagensFarmId, setPesagensFarmId] = useState("");
  const [pesagensResult, setPesagensResult] = useState<ImportResult>(null);
  const [pesagensLoading, setPesagensLoading] = useState(false);
  const pesagensInputRef = useRef<HTMLInputElement>(null);

  // Custos state
  const [custosFile, setCustosFile] = useState<File | null>(null);
  const [custosPreview, setCustosPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [custosFarmId, setCustosFarmId] = useState("");
  const [custosResult, setCustosResult] = useState<ImportResult>(null);
  const [custosLoading, setCustosLoading] = useState(false);
  const custosInputRef = useRef<HTMLInputElement>(null);

  async function readFileText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file, "utf-8");
    });
  }

  // ── Animais Handlers ───────────────────────────────────────────────────────
  async function handleAnimaisFile(file: File | null) {
    setAnimaisFile(file);
    setAnimaisPreview(null);
    setAnimaisResult(null);
    if (!file) return;
    const text = await readFileText(file);
    setAnimaisPreview(parseCSV(text));
  }

  async function handleAnimaisImport() {
    if (!animaisFile || !animaisFarmId) return;
    setAnimaisLoading(true);
    setAnimaisResult(null);
    try {
      const text = await readFileText(animaisFile);
      const { headers, rows } = parseCSV(text);

      const idxBrinco = headers.findIndex((h) => h.toLowerCase() === "brinco");
      const idxCategoria = headers.findIndex((h) => h.toLowerCase() === "categoria");
      const idxSexo = headers.findIndex((h) => h.toLowerCase() === "sexo");
      const idxRaca = headers.findIndex((h) => h.toLowerCase() === "raca" || h.toLowerCase() === "raça");
      const idxData = headers.findIndex((h) => h.toLowerCase() === "data_entrada");
      const idxPeso = headers.findIndex((h) => h.toLowerCase() === "peso_entrada");
      const idxCusto = headers.findIndex((h) => h.toLowerCase() === "custo_compra");

      const importRows: AnimalImportRow[] = rows
        .filter((r) => r.length > 1)
        .map((r) => ({
          tag: idxBrinco >= 0 ? r[idxBrinco] || undefined : undefined,
          category: idxCategoria >= 0 ? r[idxCategoria] : "",
          sex: idxSexo >= 0 ? r[idxSexo] : "",
          breed: idxRaca >= 0 ? r[idxRaca] || undefined : undefined,
          entryDate: idxData >= 0 ? r[idxData] : new Date().toISOString().split("T")[0],
          entryWeight: idxPeso >= 0 && r[idxPeso] ? parseFloat(r[idxPeso]) || undefined : undefined,
          purchaseCost: idxCusto >= 0 && r[idxCusto] ? parseFloat(r[idxCusto]) || undefined : undefined,
        }));

      const result = await importAnimals(animaisFarmId, importRows);
      setAnimaisResult(result);
    } finally {
      setAnimaisLoading(false);
    }
  }

  // ── Pesagens Handlers ──────────────────────────────────────────────────────
  async function handlePesagensFile(file: File | null) {
    setPesagensFile(file);
    setPesagensPreview(null);
    setPesagensResult(null);
    if (!file) return;
    const text = await readFileText(file);
    setPesagensPreview(parseCSV(text));
  }

  async function handlePesagensImport() {
    if (!pesagensFile || !pesagensFarmId) return;
    setPesagensLoading(true);
    setPesagensResult(null);
    try {
      const text = await readFileText(pesagensFile);
      const { headers, rows } = parseCSV(text);

      const idxData = headers.findIndex((h) => h.toLowerCase() === "data");
      const idxBrincoOuLote = headers.findIndex((h) => h.toLowerCase() === "brinco_ou_lote");
      const idxPeso = headers.findIndex((h) => h.toLowerCase() === "peso");
      const idxResponsavel = headers.findIndex(
        (h) => h.toLowerCase() === "responsavel" || h.toLowerCase() === "responsável"
      );

      // Load lot codes from the lots prop for this farm to distinguish lot vs animal
      const farmLots = lots.filter((l) => l.farmId === pesagensFarmId);
      const lotCodes = new Set(farmLots.map((l) => l.code.toLowerCase()));

      const importRows: WeighingImportRow[] = rows
        .filter((r) => r.length > 1)
        .map((r) => {
          const brincoOuLote = idxBrincoOuLote >= 0 ? r[idxBrincoOuLote] ?? "" : "";
          const isLot = lotCodes.has(brincoOuLote.toLowerCase());

          return {
            date: idxData >= 0 ? r[idxData] : new Date().toISOString().split("T")[0],
            lotCode: isLot ? brincoOuLote : undefined,
            animalTag: !isLot ? brincoOuLote || undefined : undefined,
            weight: idxPeso >= 0 ? parseFloat(r[idxPeso]) || 0 : 0,
            responsible: idxResponsavel >= 0 ? r[idxResponsavel] || undefined : undefined,
          };
        });

      const result = await importWeighings(pesagensFarmId, importRows);
      setPesagensResult(result);
    } finally {
      setPesagensLoading(false);
    }
  }

  // ── Custos Handlers ────────────────────────────────────────────────────────
  async function handleCustosFile(file: File | null) {
    setCustosFile(file);
    setCustosPreview(null);
    setCustosResult(null);
    if (!file) return;
    const text = await readFileText(file);
    setCustosPreview(parseCSV(text));
  }

  async function handleCustosImport() {
    if (!custosFile || !custosFarmId) return;
    setCustosLoading(true);
    setCustosResult(null);
    try {
      const text = await readFileText(custosFile);
      const { headers, rows } = parseCSV(text);

      const idxData = headers.findIndex((h) => h.toLowerCase() === "data");
      const idxDesc = headers.findIndex(
        (h) => h.toLowerCase() === "descricao" || h.toLowerCase() === "descrição"
      );
      const idxValor = headers.findIndex((h) => h.toLowerCase() === "valor");
      const idxCategoria = headers.findIndex((h) => h.toLowerCase() === "categoria");
      const idxTipo = headers.findIndex((h) => h.toLowerCase() === "tipo");
      const idxVencimento = headers.findIndex((h) => h.toLowerCase() === "vencimento");

      const importRows: CostImportRow[] = rows
        .filter((r) => r.length > 1)
        .map((r) => ({
          date: idxData >= 0 ? r[idxData] : new Date().toISOString().split("T")[0],
          description: idxDesc >= 0 ? r[idxDesc] : "",
          amount: idxValor >= 0 ? parseFloat(r[idxValor]) || 0 : 0,
          category: idxCategoria >= 0 ? r[idxCategoria] : "",
          type: idxTipo >= 0 ? r[idxTipo] : "",
          dueDate: idxVencimento >= 0 && r[idxVencimento] ? r[idxVencimento] : undefined,
        }));

      const result = await importCosts(custosFarmId, importRows);
      setCustosResult(result);
    } finally {
      setCustosLoading(false);
    }
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "animais", label: "Animais" },
    { key: "pesagens", label: "Pesagens" },
    { key: "custos", label: "Custos" },
  ];

  function ResultBanner({ result }: { result: ImportResult }) {
    if (!result) return null;
    if ("error" in result && result.error) {
      return (
        <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          Erro: {result.error}
        </div>
      );
    }
    const count = "count" in result ? result.count : 0;
    return (
      <div className="mt-3 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
        {count} {count === 1 ? "registro importado" : "registros importados"} com sucesso!
      </div>
    );
  }

  function PreviewTable({ data }: { data: { headers: string[]; rows: string[][] } | null }) {
    if (!data) return null;
    const preview = data.rows.slice(0, 5);
    return (
      <div className="mt-3 overflow-x-auto rounded-md border text-xs">
        <table className="min-w-full">
          <thead className="bg-muted">
            <tr>
              {data.headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "" : "bg-muted/30"}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.rows.length > 5 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            … e mais {data.rows.length - 5} linhas
          </p>
        )}
        <p className="px-3 py-2 text-xs text-muted-foreground border-t">
          Total: {data.rows.length} linha{data.rows.length !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  function FarmSelect({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) {
    return (
      <div className="mt-3">
        <label className="text-sm font-medium">Fazenda *</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Selecione uma fazenda</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-green-600 text-green-700"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Animais Tab ─────────────────────────────────────────────────── */}
      {activeTab === "animais" && (
        <Card>
          <CardHeader>
            <CardTitle>Importar Animais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Formato esperado do CSV:</p>
              <p>
                <code>brinco,categoria,sexo,raca,data_entrada,peso_entrada,custo_compra</code>
              </p>
              <p>Categorias: BOI, GARROTE, NOVILHA, NOVILHO, VACA, BEZERRA, BEZERRO, TOURO</p>
              <p>Sexo: MALE, FEMALE</p>
              <p>Data: AAAA-MM-DD (ex: 2024-03-15)</p>
            </div>

            <div>
              <label className="text-sm font-medium">Arquivo CSV *</label>
              <input
                ref={animaisInputRef}
                type="file"
                accept=".csv"
                className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:cursor-pointer"
                onChange={(e) => handleAnimaisFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <PreviewTable data={animaisPreview} />

            <FarmSelect value={animaisFarmId} onChange={setAnimaisFarmId} />

            <Button
              onClick={handleAnimaisImport}
              disabled={!animaisFile || !animaisFarmId || animaisLoading}
              className="mt-2"
            >
              {animaisLoading
                ? "Importando…"
                : animaisPreview
                ? `Importar ${animaisPreview.rows.length} registro${animaisPreview.rows.length !== 1 ? "s" : ""}`
                : "Importar"}
            </Button>

            <ResultBanner result={animaisResult} />
          </CardContent>
        </Card>
      )}

      {/* ── Pesagens Tab ─────────────────────────────────────────────────── */}
      {activeTab === "pesagens" && (
        <Card>
          <CardHeader>
            <CardTitle>Importar Pesagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Formato esperado do CSV:</p>
              <p>
                <code>data,brinco_ou_lote,peso,responsavel</code>
              </p>
              <p>Se o valor em &quot;brinco_ou_lote&quot; for um código de lote, será associado ao lote; caso contrário, será associado ao animal pelo brinco.</p>
              <p>Data: AAAA-MM-DD · Peso em kg</p>
            </div>

            <div>
              <label className="text-sm font-medium">Arquivo CSV *</label>
              <input
                ref={pesagensInputRef}
                type="file"
                accept=".csv"
                className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:cursor-pointer"
                onChange={(e) => handlePesagensFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <PreviewTable data={pesagensPreview} />

            <FarmSelect value={pesagensFarmId} onChange={setPesagensFarmId} />

            <Button
              onClick={handlePesagensImport}
              disabled={!pesagensFile || !pesagensFarmId || pesagensLoading}
              className="mt-2"
            >
              {pesagensLoading
                ? "Importando…"
                : pesagensPreview
                ? `Importar ${pesagensPreview.rows.length} registro${pesagensPreview.rows.length !== 1 ? "s" : ""}`
                : "Importar"}
            </Button>

            <ResultBanner result={pesagensResult} />
          </CardContent>
        </Card>
      )}

      {/* ── Custos Tab ───────────────────────────────────────────────────── */}
      {activeTab === "custos" && (
        <Card>
          <CardHeader>
            <CardTitle>Importar Custos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Formato esperado do CSV:</p>
              <p>
                <code>data,descricao,valor,categoria,tipo,vencimento</code>
              </p>
              <p>
                Categorias: FUNCIONARIO, ENERGIA, ARRENDAMENTO, RACAO, SAL_MINERAL, VACINA,
                MEDICAMENTO, FRETE, MANUTENCAO, COMISSAO, COMBUSTIVEL, VETERINARIO, OUTROS
              </p>
              <p>Tipo: FIXED, VARIABLE</p>
              <p>Data e vencimento: AAAA-MM-DD · Valor em reais (ex: 1250.50)</p>
            </div>

            <div>
              <label className="text-sm font-medium">Arquivo CSV *</label>
              <input
                ref={custosInputRef}
                type="file"
                accept=".csv"
                className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:cursor-pointer"
                onChange={(e) => handleCustosFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <PreviewTable data={custosPreview} />

            <FarmSelect value={custosFarmId} onChange={setCustosFarmId} />

            <Button
              onClick={handleCustosImport}
              disabled={!custosFile || !custosFarmId || custosLoading}
              className="mt-2"
            >
              {custosLoading
                ? "Importando…"
                : custosPreview
                ? `Importar ${custosPreview.rows.length} registro${custosPreview.rows.length !== 1 ? "s" : ""}`
                : "Importar"}
            </Button>

            <ResultBanner result={custosResult} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
