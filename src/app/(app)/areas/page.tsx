import Link from "next/link";
import { Plus } from "lucide-react";
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

const areaTypeLabels: Record<string, string> = {
  PASTO: "Pasto",
  CURRAL: "Curral",
  PIQUETE: "Piquete",
  BAIA: "Baia",
  CONFINAMENTO: "Confinamento",
  OUTRO: "Outro",
};

// Dados mock para MVP
const mockAreas = [
  { id: "1", name: "Pasto 1", type: "PASTO", farmName: "Fazenda Santa Maria", capacityHead: 200, activeLots: 1 },
  { id: "2", name: "Pasto 2", type: "PASTO", farmName: "Fazenda Santa Maria", capacityHead: 150, activeLots: 0 },
  { id: "3", name: "Pasto 3", type: "PASTO", farmName: "Fazenda Santa Maria", capacityHead: 180, activeLots: 1 },
  { id: "4", name: "Curral de manejo", type: "CURRAL", farmName: "Fazenda Santa Maria", capacityHead: 50, activeLots: 0 },
  { id: "5", name: "Baia A", type: "BAIA", farmName: "Confinamento BR-365", capacityHead: 100, activeLots: 1 },
  { id: "6", name: "Baia B", type: "BAIA", farmName: "Confinamento BR-365", capacityHead: 100, activeLots: 0 },
];

export default function AreasPage() {
  return (
    <>
      <Header
        title="Áreas"
        subtitle="Pastos, currais e estruturas da fazenda"
        actions={
          <Button asChild>
            <Link href="/areas/nova">
              <Plus className="h-4 w-4" />
              Nova Área
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fazenda</TableHead>
                <TableHead className="text-right">Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{areaTypeLabels[area.type] ?? area.type}</TableCell>
                  <TableCell>{area.farmName}</TableCell>
                  <TableCell className="text-right">
                    {area.capacityHead ? `${area.capacityHead} cab.` : "-"}
                  </TableCell>
                  <TableCell>
                    {area.activeLots > 0 ? (
                      <Badge variant="success">Ocupada</Badge>
                    ) : (
                      <Badge variant="secondary">Livre</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/areas/${area.id}`}>Ver</Link>
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
