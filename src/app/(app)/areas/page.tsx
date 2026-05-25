import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { requireTenant } from "@/server/services/tenant";
import { getAreasPageData } from "@/server/queries/areas";
import { AreaDialog } from "./area-dialog";

type AreaRow = Awaited<ReturnType<typeof getAreasPageData>>["areas"][number];

const areaTypeLabels: Record<string, string> = {
  PASTO: "Pasto", CURRAL: "Curral", PIQUETE: "Piquete",
  BAIA: "Baia", CONFINAMENTO: "Confinamento", OUTRO: "Outro",
};

export default async function AreasPage() {
  const { tenant } = await requireTenant();
  const { farms, areas } = await getAreasPageData(tenant.id);

  return (
    <>
      <Header
        title="Áreas"
        subtitle="Pastos, currais e estruturas da fazenda"
        actions={<AreaDialog farms={farms} />}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma área cadastrada ainda.
                  </TableCell>
                </TableRow>
              ) : areas.map((area: AreaRow) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{areaTypeLabels[area.type ?? "OUTRO"] ?? area.type}</TableCell>
                  <TableCell>{area.farm.name}</TableCell>
                  <TableCell className="text-right">
                    {area.capacityHead ? `${area.capacityHead} cab.` : "—"}
                  </TableCell>
                  <TableCell>
                    {area._count.lots > 0 ? (
                      <Badge variant="success">Ocupada ({area._count.lots})</Badge>
                    ) : (
                      <Badge variant="secondary">Livre</Badge>
                    )}
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
