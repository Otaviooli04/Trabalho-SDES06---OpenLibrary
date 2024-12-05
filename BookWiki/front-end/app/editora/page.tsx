"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Container, Group, Text, Button, Card, Title, Loader, TextInput, useMantineTheme, useMantineColorScheme, ActionIcon, Table, Center, rem, ScrollArea, Pagination } from '@mantine/core';
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import { IconSettings, IconSearch, IconArrowLeft } from '@tabler/icons-react';

interface User {
  usuario_id: number;
  nome: string;
  email: string;
  tipo: string;
}

interface Editora {
  editora_id: number;
  nome: string;
}

export default function EditoraPage() {
  const [user, setUser] = useState<User | null>(null);
  const [editoras, setEditoras] = useState<Editora[]>([]);
  const [filteredEditoras, setFilteredEditoras] = useState<Editora[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get("http://localhost:3001/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      setError("Erro ao buscar informações do usuário.");
    }
  };

  const fetchEditoras = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get("http://localhost:3001/editoras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEditoras(response.data);
      setFilteredEditoras(response.data);
    } catch (error) {
      setError("Erro ao buscar editoras.");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchEditoras();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    const filtered = editoras.filter((editora) =>
      (editora.nome?.toLowerCase().includes(value.toLowerCase()) ?? false)
    );
    setFilteredEditoras(filtered);
    setActivePage(1); // Reset to first page on search
  };

  const handleViewEditora = (editora: Editora) => {
    console.log(editora.editora_id);
    router.push(`/editoraInfo/${editora.editora_id}`);
  };

  const paginatedEditoras = filteredEditoras.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!user) {
    return <Loader />;
  }

  const buttonColor = colorScheme === 'dark' ? 'white' : 'black';
  const buttonBgColor = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <Container mt="xl">
      <Group justify="right" className="h-full py-2 px-2">
        <ColorSchemesSwitcher />
        <ActionIcon onClick={() => router.push('/profile')} color={buttonBgColor} style={{ color: buttonColor }}>
          <IconSettings size={16} />
        </ActionIcon>
      </Group>
      <Button variant="outline" onClick={() => router.push('/menu')} mb="md" color={buttonBgColor} style={{ color: buttonColor }}>
        <IconArrowLeft size={16} style={{ marginRight: 8 }} />
        Voltar para o menu
      </Button>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>Editoras</Title>
        </Group>

        {success && <Text color="green">{success}</Text>}

        <ScrollArea>
          <TextInput
            placeholder="Search by any field"
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
          <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed" striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nome</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedEditoras.map((editora) => (
                <Table.Tr key={editora.editora_id} onClick={() => handleViewEditora(editora)} style={{ cursor: 'pointer' }}>
                  <Table.Td className="table-cell">{editora.nome}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Center mt="md">
          <Pagination value={activePage} onChange={setActivePage} total={Math.ceil(filteredEditoras.length / itemsPerPage)} />
        </Center>
      </Card>
    </Container>
  );
}