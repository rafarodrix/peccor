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
import { formatDate } from "@/lib/utils";

const eventTypeLabels: Record<string, string> = {
  VACINA: "Vacina",
  VERMIFUGO: "Vermífugo",
  MEDICAMENTO: "Medicamento",
  DOENCA: "Doença",
  MORTE: "Morte",
  OUTRO: "Outro",
};

const eventTypeColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  VACINA: "success",
  VERMIFUGO: "default",
  MEDICAMENTO: "warning",
  DOENCA: "destructive",
  MORTE: "destructive",
  OUTRO: "secondary",
};

// Dados mock para MVP
const mockHealthEvents = [
  {
    id: "1",
    date: new Date("2026-05-12"),
    type: "VACINA",
    description: "Vacinação antiaftosa",
    productName: "Aftovax",
    dosage: "2ml",
    animalTag: null,
    lotCode: "RECRIA-2026-01",
    farmName: "Fazenda Santa Maria",
    withdrawalDays: 0,
    responsible: "Dr. Carlos Vet",
  },
  {
    id: "2",
    date: new Date("2026-05-08"),
    type: "VERMIFUGO",
    description: "Vermifugação do lote",
    productName: "Ivermectina 1%",
    dosage: "1ml/50kg",
    animalTag: null,
    lotCode: "ENGORDA-2026-01",
    farmName: "Fazenda Santa Maria",
    withdrawalDays: 30,
    responsible: "João Silva",
  },
  {
    id: "3",
    date: new Date("2026-05-03"),
    type: "DOENCA",
    description: "Pneumonia - tratamento",
    productName: "Oxitetraciclina",
    dosage: "10mg/kg",
    animalTag: "BR-0015",
    lotCode: "ENGORDA-2026-01",
    farmName: "Fazenda Santa Maria",
    withdrawalDays: 28,
    responsible: "Dr. Carlos Vet",
  },
];

export default function ManejoSanitarioPage() {
  return (
    <>
      <Header
        title="Manejo Sanitário"
        subtitle="Controle de vacinas, medicamentos e ocorrências"
        actions={
          <Button asChild>
            <Link href="/manejo-sanitario/novo">
              <Plus className="h-4 w-4" />
              Registrar Evento
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
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Animal / Lote</TableHead>
                <TableHead>Fazenda</TableHead>
                <TableHead className="text-right">Carência (dias)</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHealthEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>
                    <Badge variant={eventTypeColors[event.type]}>
                      {eventTypeLabels[event.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{event.description}</TableCell>
                  <TableCell>{event.productName ?? "-"}</TableCell>
                  <TableCell>{event.dosage ?? "-"}</TableCell>
                  <TableCell>
                    {event.animalTag ? (
                      <span className="font-mono text-sm">{event.animalTag}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">{event.lotCode}</span>
                    )}
                  </TableCell>
                  <TableCell>{event.farmName}</TableCell>
                  <TableCell className="text-right">
                    {event.withdrawalDays > 0 ? event.withdrawalDays : "-"}
                  </TableCell>
                  <TableCell>{event.responsible}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
