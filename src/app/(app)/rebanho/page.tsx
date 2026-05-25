import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

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

const statusColors: Record<string, "success" | "secondary" | "destructive" | "warning"> = {
  ACTIVE: "success",
  SOLD: "secondary",
  DEAD: "destructive",
  TRANSFERRED: "warning",
  LOST: "destructive",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  SOLD: "Vendido",
  DEAD: "Morto",
  TRANSFERRED: "Transferido",
  LOST: "Perdido",
};

// Dados mock para MVP
const mockAnimals = [
  {
    id: "1",
    tag: "BR-0001",
    category: "BOI",
    sex: "MALE",
    breed: "Nelore",
    lotCode: "ENGORDA-2026-01",
    farmName: "Fazenda Santa Maria",
    currentWeight: 385,
    purchaseCost: 3200,
    entryDate: new Date("2026-01-15"),
    status: "ACTIVE",
    lastWeighing: { date: new Date("2026-05-01"), dailyGain: 1.2 },
  },
  {
    id: "2",
    tag: "BR-0002",
    category: "NOVILHO",
    sex: "MALE",
    breed: "Angus",
    lotCode: "TERMINACAO-2026-01",
    farmName: "Confinamento BR-365",
    currentWeight: 465,
    purchaseCost: 4100,
    entryDate: new Date("2025-11-10"),
    status: "ACTIVE",
    lastWeighing: { date: new Date("2026-05-05"), dailyGain: 1.5 },
  },
  {
    id: "3",
    tag: "BR-0003",
    category: "GARROTE",
    sex: "MALE",
    breed: "Nelore",
    lotCode: "RECRIA-2026-01",
    farmName: "Fazenda Santa Maria",
    currentWeight: 265,
    purchaseCost: 2000,
    entryDate: new Date("2026-02-20"),
    status: "ACTIVE",
    lastWeighing: { date: new Date("2026-05-10"), dailyGain: 0.9 },
  },
];

export default function RebanhoPage() {
  return (
    <>
      <Header
        title="Rebanho"
        subtitle="Controle individual do seu rebanho"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
            <Button asChild>
              <Link href="/rebanho/novo">
                <Plus className="h-4 w-4" />
                Novo Animal
              </Link>
            </Button>
          </div>
        }
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brinco</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Fazenda</TableHead>
                <TableHead className="text-right">Peso Atual</TableHead>
                <TableHead className="text-right">GMD</TableHead>
                <TableHead className="text-right">Custo Compra</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAnimals.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.tag}</TableCell>
                  <TableCell>{categoryLabels[animal.category] ?? animal.category}</TableCell>
                  <TableCell>{animal.breed}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{animal.lotCode}</span>
                  </TableCell>
                  <TableCell>{animal.farmName}</TableCell>
                  <TableCell className="text-right">
                    {animal.currentWeight ? `${formatNumber(animal.currentWeight)} kg` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {animal.lastWeighing?.dailyGain
                      ? `${formatNumber(animal.lastWeighing.dailyGain, 3)} kg/d`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(animal.purchaseCost)}
                  </TableCell>
                  <TableCell>{formatDate(animal.entryDate)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[animal.status] ?? "default"}>
                      {statusLabels[animal.status] ?? animal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/rebanho/${animal.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
