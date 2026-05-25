import Link from "next/link";
import { Plus, MapPin, Beef, Layers } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const operationLabels: Record<string, string> = {
  CRIA: "Cria",
  RECRIA: "Recria",
  ENGORDA: "Engorda",
  CONFINAMENTO: "Confinamento",
  CICLO_COMPLETO: "Ciclo Completo",
};

// Dados mock para MVP
const mockFarms = [
  {
    id: "1",
    name: "Fazenda Santa Maria",
    city: "Uberlândia",
    state: "MG",
    operation: "CICLO_COMPLETO",
    totalArea: 1200,
    pastureArea: 900,
    _count: { animals: 280, lots: 4, areas: 8 },
  },
  {
    id: "2",
    name: "Confinamento BR-365",
    city: "Patos de Minas",
    state: "MG",
    operation: "CONFINAMENTO",
    totalArea: 150,
    pastureArea: 0,
    _count: { animals: 170, lots: 2, areas: 3 },
  },
];

export default function FazendasPage() {
  return (
    <>
      <Header
        title="Fazendas"
        subtitle="Gerencie suas propriedades rurais"
        actions={
          <Button asChild>
            <Link href="/fazendas/nova">
              <Plus className="h-4 w-4" />
              Nova Fazenda
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockFarms.map((farm) => (
            <Card key={farm.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{farm.name}</CardTitle>
                  <Badge variant="secondary">{operationLabels[farm.operation]}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {farm.city}, {farm.state}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-muted p-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Beef className="h-3 w-3" />
                      Animais
                    </div>
                    <div className="mt-1 text-lg font-bold">{farm._count.animals}</div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Layers className="h-3 w-3" />
                      Lotes
                    </div>
                    <div className="mt-1 text-lg font-bold">{farm._count.lots}</div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Áreas
                    </div>
                    <div className="mt-1 text-lg font-bold">{farm._count.areas}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Área total: {farm.totalArea} ha</span>
                  <span>Pastagem: {farm.pastureArea} ha</span>
                </div>
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/fazendas/${farm.id}`}>Ver detalhes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
