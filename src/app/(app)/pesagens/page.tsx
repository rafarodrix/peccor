import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Dados mock para MVP
const mockWeighings = [
  {
    id: "1",
    date: new Date("2026-05-10"),
    lotCode: "RECRIA-2026-01",
    animalTag: null,
    weight: 265,
    previousWeight: 240,
    weightGain: 25,
    daysSinceLast: 28,
    dailyGain: 0.893,
    responsible: "João Silva",
  },
  {
    id: "2",
    date: new Date("2026-05-05"),
    lotCode: "TERMINACAO-2026-01",
    animalTag: "BR-0002",
    weight: 465,
    previousWeight: 420,
    weightGain: 45,
    daysSinceLast: 30,
    dailyGain: 1.5,
    responsible: "Maria Souza",
  },
  {
    id: "3",
    date: new Date("2026-05-01"),
    lotCode: "ENGORDA-2026-01",
    animalTag: "BR-0001",
    weight: 385,
    previousWeight: 349,
    weightGain: 36,
    daysSinceLast: 30,
    dailyGain: 1.2,
    responsible: "João Silva",
  },
];

export default function PesagensPage() {
  return (
    <>
      <Header
        title="Pesagens"
        subtitle="Histórico de pesagens e controle de GMD"
        actions={
          <Button asChild>
            <Link href="/pesagens/nova">
              <Plus className="h-4 w-4" />
              Registrar Pesagem
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead className="text-right">Peso Anterior</TableHead>
                <TableHead className="text-right">Peso Atual</TableHead>
                <TableHead className="text-right">Ganho</TableHead>
                <TableHead className="text-right">Dias</TableHead>
                <TableHead className="text-right">GMD</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockWeighings.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{formatDate(w.date)}</TableCell>
                  <TableCell className="font-medium">{w.lotCode}</TableCell>
                  <TableCell>{w.animalTag ?? <span className="text-muted-foreground">Lote</span>}</TableCell>
                  <TableCell className="text-right">
                    {w.previousWeight ? `${formatNumber(w.previousWeight)} kg` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(w.weight)} kg
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    +{formatNumber(w.weightGain)} kg
                  </TableCell>
                  <TableCell className="text-right">{w.daysSinceLast}d</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-medium",
                        w.dailyGain >= 1.2
                          ? "text-green-600"
                          : w.dailyGain >= 0.8
                          ? "text-yellow-600"
                          : "text-red-600"
                      )}
                    >
                      {formatNumber(w.dailyGain, 3)} kg/d
                    </span>
                  </TableCell>
                  <TableCell>{w.responsible}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
