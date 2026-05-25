import { Plus, MapPin, Beef, Layers } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { requireTenant } from "@/server/services/tenant";
import { getFarms } from "@/server/queries/farms";
import { FarmDialog } from "./farm-dialog";

const operationLabels: Record<string, string> = {
  CRIA: "Cria",
  RECRIA: "Recria",
  ENGORDA: "Engorda",
  CONFINAMENTO: "Confinamento",
  CICLO_COMPLETO: "Ciclo Completo",
};

export default async function FazendasPage() {
  const { tenant } = await requireTenant();
  const farms = await getFarms(tenant.id);

  return (
    <>
      <Header
        title="Fazendas"
        subtitle="Gerencie suas propriedades rurais"
        actions={<FarmDialog />}
      />
      <div className="p-6">
        {farms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma fazenda cadastrada ainda.</p>
            <FarmDialog label="Cadastrar primeira fazenda" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {farms.map((farm) => (
              <Card key={farm.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{farm.name}</CardTitle>
                    <Badge variant="secondary">{operationLabels[farm.operation]}</Badge>
                  </div>
                  {farm.city && farm.state && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {farm.city}, {farm.state}
                    </div>
                  )}
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
                  {(farm.totalArea || farm.pastureArea) && (
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      {farm.totalArea && <span>Total: {Number(farm.totalArea)} ha</span>}
                      {farm.pastureArea && <span>Pastagem: {Number(farm.pastureArea)} ha</span>}
                    </div>
                  )}
                  <div className="mt-3">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/fazendas/${farm.id}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
