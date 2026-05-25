import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getUsers } from "@/server/actions/users";
import { UserManagementClient } from "./user-management-client";

export default async function UsuariosPage() {
  const users = await getUsers();

  return (
    <>
      <Header
        title="Usuários"
        subtitle="Gerencie quem tem acesso ao sistema"
      />
      <div className="p-6">
        <UserManagementClient users={users} />
      </div>
    </>
  );
}
