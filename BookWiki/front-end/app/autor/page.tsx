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

interface Autor {
  autor_key: string;
  nome: string;
  foto_url: string;
  qtd_trabalhos: number;
  livro_autor: {
    livro: {
      livro_key: string;
      titulo: string;
    };
  }[];
}

export default function AutorPage() {
  const [user, setUser] = useState<User | null>(null);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [filteredAutores, setFilteredAutores] = useState<Autor[]>([]);
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

  const fetchAutores = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get("http://localhost:3001/autores", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAutores(response.data);
      setFilteredAutores(response.data);
    } catch (error) {
      setError("Erro ao buscar autores.");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAutores();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    const filtered = autores.filter((autor) =>
      (autor.nome?.toLowerCase().includes(value.toLowerCase()) ?? false)
    );
    setFilteredAutores(filtered);
    setActivePage(1); // Reset to first page on search
  };
  const handleViewAutor = (autor: Autor) => {
    console.log(autor.autor_key);
    router.push(`/autorInfo/${autor.autor_key}`);
  };

  const paginatedAutores = filteredAutores.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

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
          <Title order={2}>Autores</Title>
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
                <Table.Th>Foto</Table.Th>
                <Table.Th>Nome</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedAutores.map((autor) => (
                <Table.Tr key={autor.autor_key} onClick={() => handleViewAutor(autor)} style={{ cursor: 'pointer' }}>
                  <Table.Td>
                    <img src={autor.foto_url} alt={autor.nome} style={{ width: 100, height: 100 }} />
                  </Table.Td>
                  <Table.Td className="table-cell">{autor.nome}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Center mt="md">
          <Pagination value={activePage} onChange={setActivePage} total={Math.ceil(filteredAutores.length / itemsPerPage)} />
        </Center>
      </Card>
    </Container>
  );
}