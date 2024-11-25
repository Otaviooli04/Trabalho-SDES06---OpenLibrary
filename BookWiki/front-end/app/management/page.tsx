"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Text,
  Stack,
  Box,
  Button,
  Select,
  Modal,
  Table,
  Group,
  Container,
  Card,
  Title,
  Loader,
  Textarea,
  FileInput,
  ScrollArea,
  TextInput,
  Center,
  rem,
  useMantineTheme,
  useMantineColorScheme,
  UnstyledButton,
} from "@mantine/core";
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import NavbarNested from "../components/Navbar";
import {
  IconEdit,
  IconArrowLeft,
  IconTrash,
  IconBook,
  IconUserPlus,
  IconBuilding,
  IconEye,
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from '@tabler/icons-react';
import classes from '../components/TableSort.module.css';

interface User {
  usuario_id: number;
  nome: string;
  email: string;
  tipo: string;
}

interface Livro {
  key: string;
  title: string;
  subtitle: string;
  first_publish_year: number;
  number_of_pages_median: number;
  cover_i?: number;
  publisher: string[];
  language: string[];
  author_key: string;
  author_name: string;
}

interface Autor {
  key: string;
  name: string;
  work_count: string;
  birth_date: string;
  death_date: string;
  top_work: string;
  top_subjects: string;
}

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data: User[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    Object.keys(item).some((key) => item[key as keyof User].toString().toLowerCase().includes(query))
  );
}

function sortData(
  data: User[],
  payload: { sortBy: keyof User | null; reversed: boolean; search: string }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].toString().localeCompare(a[sortBy].toString());
      }

      return a[sortBy].toString().localeCompare(b[sortBy].toString());
    }),
    payload.search
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [nomeLivro, setNomeLivro] = useState("");
  const [nomeAutor, setNomeAutor] = useState("");
  const [livros, setLivros] = useState<Livro[]>([]);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [selectedLivro, setSelectedLivro] = useState<string | null>(null);
  const [selectedAutor, setSelectedAutor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLivroModalOpen, setIsLivroModalOpen] = useState(false);
  const [isEditoraModalOpen, setIsEditoraModalOpen] = useState(false);
  const [isAutorModalOpen, setIsAutorModalOpen] = useState(false);
  const [isVisualizarLivrosModalOpen, setIsVisualizarLivrosModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserType, setNewUserType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(users);
  const [sortBy, setSortBy] = useState<keyof User | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const buttonColor = colorScheme === 'dark' ? 'white' : 'black';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token não encontrado.");
          return;
        }

        const response = await axios.get("http://localhost:3001/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
        setSortedData(response.data);
      } catch (error) {
        setError("Erro ao buscar usuários.");
        console.error("Erro ao buscar usuários:", error);
      }
    };

    fetchUsers();
  }, []);

  const setSorting = (field: keyof User) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(users, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(users, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const rows = sortedData.map((user) => {
    
    return (
      <Table.Tr key={user.usuario_id}>
        <Table.Td>{user.nome}</Table.Td>
        <Table.Td>{user.email}</Table.Td>
        <Table.Td>{user.tipo}</Table.Td>
        <Table.Td>
          <Button variant="outline" color={buttonColor} onClick={() => { setSelectedUser(user); setIsEditUserModalOpen(true); }}>
            <IconEdit size={16} />
          </Button>
          <Button variant="outline" color={buttonColor} onClick={() => deleteUser(user.usuario_id)}>
            <IconTrash size={16} />
          </Button>
        </Table.Td>
      </Table.Tr>
    );
  });

  const fetchLivros = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/buscar-livros?nomeLivro=${nomeLivro}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLivros(response.data);
      setError(null);
    } catch (error) {
      setError("Erro ao buscar livros.");
      console.error("Erro ao buscar livros:", error);
    }
  };

  const registerLivro = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const livro = livros.find(l => l.key === selectedLivro);
      if (!livro) {
        setError("Livro não encontrado.");
        return;
      }

      const response = await axios.post("http://localhost:3001/livros/registro", {
        livro_key: livro.key,
        titulo: livro.title,
        subtitulo: livro.subtitle,
        ano_publicacao: livro.first_publish_year,
        qtd_paginas: livro.number_of_pages_median,
        capa_url: livro.cover_i ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-L.jpg` : null,
        editora_nome: livro.publisher[0],
        lingua_sigla: livro.language[0],
        author_key: livro.author_key,
        author_name: livro.author_name,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Livro registrado com sucesso.");
      setError(null);
      setIsLivroModalOpen(false);
    } catch (error) {
      setError("Erro ao registrar livro.");
      console.error("Erro ao registrar livro:", error);
    }
  };


  const fetchAutores = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/buscar-autores?nomeAutor=${nomeAutor}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAutores(response.data);
      setError(null);
    } catch (error) {
      setError("Erro ao buscar autores.");
      console.error("Erro ao buscar autores:", error);
    }
  };

  const registerAutor = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const autor = autores.find(l => l.key === selectedAutor);
      if (!autor) {
        setError("Autor não encontrado.");
        return;
      }

      const response = await axios.post("http://localhost:3001/autores/registro", {
        author_key: autor.key,
        author_name: autor.name,
        author_work_count: autor.work_count,
        author_birth_date: autor.birth_date,
        author_death_date: autor.death_date,
        author_top_work: autor.top_work,
        author_top_subjects: autor.top_subjects,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Autor registrado com sucesso.");
      setError(null);
      setIsLivroModalOpen(false);
    } catch (error) {
      setError("Erro ao registrar autor.");
      console.error("Erro ao registrar autor:", error);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      await axios.delete(`http://localhost:3001/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const updatedUsers = users.filter(user => user.usuario_id !== userId);
      setUsers(updatedUsers);
      setSortedData(updatedUsers);
      setSuccess("Usuário excluído com sucesso.");
    } catch (error) {
      setError("Erro ao excluir usuário.");
      console.error("Erro ao excluir usuário:", error);
    }
  };

  const editUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      if (!selectedUser || !newUserType) {
        setError("Usuário ou tipo de usuário não selecionado.");
        return;
      }
  
      const response = await axios.put(`http://localhost:3001/users/${selectedUser.usuario_id}`, {
        tipo: newUserType,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setUsers(users.map(user => user.usuario_id === selectedUser.usuario_id ? { ...user, tipo: newUserType } : user));
      setSortedData(users.map(user => user.usuario_id === selectedUser.usuario_id ? { ...user, tipo: newUserType } : user));
      setSuccess("Tipo de usuário atualizado com sucesso.");
      setError(null);
      setIsEditUserModalOpen(false);
    } catch (error) {
      setError("Erro ao atualizar tipo de usuário.");
      console.error("Erro ao atualizar tipo de usuário:", error);
    }
  };

  return (
    <Container mt="xl">
      <Group justify="right" className="h-full py-2 px-2">
        <ColorSchemesSwitcher />
      </Group>
      <NavbarNested />
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>Administração</Title>
        </Group>

        {error && <Text color="red">{error}</Text>}
        {success && <Text color="green">{success}</Text>}

        <Title order={3} mt="lg" mb="sm">Usuários Cadastrados</Title>
        <ScrollArea>
          <TextInput
            placeholder="Search by any field"
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
          <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed" striped highlightOnHover  withColumnBorders>
            <Table.Tbody>
              <Table.Tr>
                <Th
                  sorted={sortBy === 'nome'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('nome')}
                >
                  Nome
                </Th>
                <Th
                  sorted={sortBy === 'email'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('email')}
                >
                  Email
                </Th>
                <Th
                  sorted={sortBy === 'tipo'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('tipo')}
                >
                  Tipo
                </Th>
                <Th reversed={false} sorted={false} onSort={function (): void {
                  throw new Error("Function not implemented.");
                } }>
                  Ações
                </Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text fw={500} ta="center">
                      Nothing found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Group mt="lg">
          <Button variant="outline" color={buttonColor} onClick={() => setIsLivroModalOpen(true)}>
            <IconBook size={16} style={{ marginRight: 8 }} />
            Adicionar Livro
          </Button>
          <Button variant="outline" color={buttonColor} onClick={() => setIsEditoraModalOpen(true)}>
            <IconBuilding size={16} style={{ marginRight: 8 }} />
            Adicionar Editora
          </Button>
          <Button variant="outline" color={buttonColor} onClick={() => setIsAutorModalOpen(true)}>
            <IconUserPlus size={16} style={{ marginRight: 8 }} />
            Adicionar Autor
          </Button>
          <Button variant="outline" color={buttonColor} onClick={() => setIsVisualizarLivrosModalOpen(true)}>
            <IconEye size={16} style={{ marginRight: 8 }} />
            Visualizar Livros
          </Button>
        </Group>
      </Card>

      <Modal opened={isLivroModalOpen} onClose={() => setIsLivroModalOpen(false)} title="Adicionar Livro">
        <Stack>
          <input
            type="text"
            value={nomeLivro}
            onChange={(e) => setNomeLivro(e.target.value)}
            placeholder="Digite o nome do livro"
          />
          <Button variant="outline" color={buttonColor} onClick={fetchLivros}>Buscar Livros</Button>
          {livros.length > 0 && (
            <Select
              label="Selecione um livro"
              placeholder="Escolha um livro"
              data={livros.map(livro => ({ value: livro.key, label: livro.title }))}
              value={selectedLivro}
              onChange={(value) => setSelectedLivro(value)}
            />
          )}
          {selectedLivro && <Button variant="outline" color={buttonColor} onClick={registerLivro}>Registrar Livro</Button>}
        </Stack>
      </Modal>


      <Modal opened={isEditoraModalOpen} onClose={() => setIsEditoraModalOpen(false)} title="Adicionar Editora">
        {/* Conteúdo do modal de adicionar editora */}
      </Modal>

      <Modal opened={isAutorModalOpen} onClose={() => setIsAutorModalOpen(false)} title="Adicionar Autor">
      <Stack>
          <input
            type="text"
            value={nomeAutor}
            onChange={(e) => setNomeAutor(e.target.value)}
            placeholder="Digite o nome do autor"
          />
          <Button variant="outline" color={buttonColor} onClick={fetchAutores}>Buscar Autores</Button>
          {autores.length > 0 && (
            <Select
              label="Selecione um autor"
              placeholder="Escolha um autor"
              data={autores.map(autor => ({ value: autor.key, label: autor.name }))}
              value={selectedAutor}
              onChange={(value) => setSelectedAutor(value)}
            />
          )}
          {selectedAutor && <Button variant="outline" color={buttonColor} onClick={registerAutor}>Registrar Autor</Button>}
        </Stack>
      </Modal>

      <Modal opened={isVisualizarLivrosModalOpen} onClose={() => setIsVisualizarLivrosModalOpen(false)} title="Visualizar Livros">
        {/* Conteúdo do modal de visualizar e remover livros */}
      </Modal>

      <Modal opened={isEditUserModalOpen} onClose={() => setIsEditUserModalOpen(false)} title="Editar Tipo de Usuário">
        <Stack>
          <Select
            label="Tipo de Usuário"
            placeholder="Selecione o tipo de usuário"
            data={[
              { value: 'admin', label: 'Admin' },
              { value: 'cliente', label: 'Cliente' },
            ]}
            value={newUserType}
            onChange={(value) => setNewUserType(value)}
          />
          <Button variant="outline" color={buttonColor} onClick={editUser}>Salvar</Button>
        </Stack>
      </Modal>
    </Container>
  );
}