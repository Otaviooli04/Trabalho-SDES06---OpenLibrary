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

interface Livro {
  livro_key: string;
  titulo: string;
  subtitulo: string;
  ano_publicacao: number;
  qtd_paginas: number;
  qtd_avaliacoes: number;
  capa_url: string;
  editora: {
    nome: string;
  };
  lingua: {
    sigla: string;
  };
  livro_autor: {
    autor: {
      autor_key: string;
      nome: string;
      foto_url: string;
    };
  }[];
}

export default function LivroPage() {
  const [user, setUser] = useState<User | null>(null);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [filteredLivros, setFilteredLivros] = useState<Livro[]>([]);
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

  const fetchLivros = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get("http://localhost:3001/livros", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLivros(response.data);
      setFilteredLivros(response.data);
    } catch (error) {
      setError("Erro ao buscar livros.");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchLivros();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    const filtered = livros.filter((livro) =>
      (livro.titulo?.toLowerCase().includes(value.toLowerCase()) ?? false) ||
      (livro.subtitulo?.toLowerCase().includes(value.toLowerCase()) ?? false) ||
      (livro.ano_publicacao?.toString().includes(value) ?? false) ||
      (livro.qtd_paginas?.toString().includes(value) ?? false)
    );
    setFilteredLivros(filtered);
    setActivePage(1); // Reset to first page on search
  };

  const handleViewLivro = (livro: Livro) => {
    router.push(`/livroInfo/${livro.livro_key}`);
  };

  const paginatedLivros = filteredLivros.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

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
          <Title order={2}>Livros</Title>
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
                <Table.Th>Capa</Table.Th>
                <Table.Th>Título</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedLivros.map((livro) => (
                <Table.Tr key={livro.livro_key} onClick={() => handleViewLivro(livro)} style={{ cursor: 'pointer' }}>
                  <Table.Td>
                    <img src={livro.capa_url} alt={livro.titulo} style={{ width: 100, height: 100 }} />
                  </Table.Td>
                  <Table.Td className="table-cell">{livro.titulo}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Center mt="md">
          <Pagination value={activePage} onChange={setActivePage} total={Math.ceil(filteredLivros.length / itemsPerPage)} />
        </Center>
      </Card>
    </Container>
  );
}