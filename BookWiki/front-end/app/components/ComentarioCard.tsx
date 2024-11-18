// components/ComentarioCard.tsx
import { Box, Text, Avatar, Group } from "@mantine/core";

interface Comentario {
  comentario_id: number;
  texto: string;
  data_criacao: string;
  usuario: {
    nome: string;
    perfil: {
      foto_url: string;
    }[];
  };
}

interface ComentarioCardProps {
  comentario: Comentario;
}

export function ComentarioCard({ comentario }: ComentarioCardProps) {
  return (
    <div className="p-4 shadow-sm border rounded-md mb-4">
      <div className="flex items-center">
        <img
          className="w-10 h-10 rounded-full"
          src={comentario.usuario.perfil[0]?.foto_url}
          alt={comentario.usuario.nome}
        />
        <div className="ml-4">
          <p className="font-semibold">{comentario.usuario.nome}</p>
          <p className="text-sm text-gray-500">{new Date(comentario.data_criacao).toLocaleDateString()}</p>
        </div>
      </div>
      <p className="mt-4">{comentario.texto}</p>
    </div>
  );
}