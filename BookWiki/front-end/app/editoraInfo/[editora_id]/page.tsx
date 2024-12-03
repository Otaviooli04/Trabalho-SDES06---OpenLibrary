// app/editoraInfo/[editora_id]/page.tsx

'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Title, Text, Loader, Card, Group, Stack, Button, useMantineColorScheme, TextInput, Table, ScrollArea } from '@mantine/core';
import { ColorSchemesSwitcher } from "../../components/color-schemes-switcher";
import { IconEdit, IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Livro {
  livro_key: string;
  titulo: string;
}

interface Editora {
  editora_id: number;
  nome: string;
  livro: Livro[];
}

const EditoraPerfil = () => {
  const router = useRouter();
  const { editora_id } = useParams();
  const [editora, setEditora] = useState<Editora | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { colorScheme } = useMantineColorScheme();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nome, setNome] = useState<string>('');

  useEffect(() => { const userString = localStorage.getItem('tipo'); if (userString === 'admin') { setIsAdmin(true); } else { setIsAdmin(false); } }, []);
  console.log("usuario admin: ", isAdmin);
  useEffect(() => {
    if (editora_id) {
      console.log(`Fetching editora with id: ${editora_id}`);
      const fetchEditora = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/editoras/${editora_id}`);
          console.log('Editora data:', response.data);
          setEditora(response.data);
          setNome(response.data.nome);
        } catch (error) {
          console.error('Erro ao buscar informações da editora:', error);
          setError("Erro ao buscar informações da editora.");
        } finally {
          setLoading(false);
        }
      };

      fetchEditora();
    } else {
      setLoading(false);
      setError("Editora id não encontrado.");
    }
  }, [editora_id]);

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:3001/editoras/${editora_id}`, { nome });
      setIsEditing(false);
      toast.success("Editora atualizada com sucesso!");
      router.push(`/editoraInfo/${editora_id}`); // Reload the page to fetch updated information
    } catch (error) {
      console.error('Erro ao atualizar editora:', error);
      setError("Erro ao atualizar editora.");
      toast.error("Erro ao atualizar editora.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/editoras/${editora_id}`);
      toast.success("Editora excluída com sucesso!");
      router.push('/editora'); // Redirect to the publisher list after deletion
    } catch (error) {
      console.error('Erro ao excluir editora:', error);
      setError("Erro ao excluir editora.");
      toast.error("Erro ao excluir editora.");
    }
  };

  const handleViewLivro = (livro_key: string) => {
    router.push(`/livroInfo/${livro_key}`);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!editora) {
    return <Text>Editora não encontrada.</Text>;
  }

  const buttonColor = colorScheme === 'dark' ? 'white' : 'black';
  const buttonBgColor = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <Container mt="xl">
      <ToastContainer position="bottom-right" />
      <Group justify="space-between" className="h-full py-2 px-2">
        <Button variant="outline" onClick={() => router.push('/editora')} mb="md" color={buttonBgColor} style={{ color: buttonColor }}>
          <IconArrowLeft size={16} style={{ marginRight: 8 }} />
          Voltar
        </Button>
        <ColorSchemesSwitcher />
      </Group>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group align="flex-start" mb="md">
          <Stack gap="xs">
            {isEditing ? (
              <>
                <TextInput
                  label="Nome"
                  value={nome}
                  onChange={(event) => setNome(event.currentTarget.value)}
                />
                <Button onClick={handleEdit}>Salvar</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </>
            ) : (
              <>
                <Title order={2}>{editora.nome}</Title>
                <ScrollArea>
                  <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed" striped highlightOnHover withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Livros da Editora</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {editora.livro.map((livro) => (
                        <Table.Tr key={livro.livro_key} onClick={() => handleViewLivro(livro.livro_key)} style={{ cursor: 'pointer' }}>
                          <Table.Td className="table-cell">{livro.titulo}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
                {isAdmin && (
                  <Group>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <IconEdit size={16} style={{ marginRight: 8 }} />
                      Editar
                    </Button>
                    <Button variant="outline" color="red" onClick={handleDelete}>
                      <IconTrash size={16} style={{ marginRight: 8 }} />
                      Excluir
                    </Button>
                  </Group>
                )}
              </>
            )}
          </Stack>
        </Group>
      </Card>
    </Container>
  );
};

export default EditoraPerfil;