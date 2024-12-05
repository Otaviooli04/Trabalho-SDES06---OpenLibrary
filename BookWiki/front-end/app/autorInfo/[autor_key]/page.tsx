// app/autorInfo/[autor_key]/page.tsx

'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Title, Text, Loader, Card, Group, Stack, Button, useMantineColorScheme, TextInput } from '@mantine/core';
import { ColorSchemesSwitcher } from "../../components/color-schemes-switcher";
import { IconEdit, IconArrowLeft, IconTrash } from '@tabler/icons-react';

interface Categoria {
  nome: string;
}

interface Livro {
  livro_key: string;
  titulo: string;
  livro_categoria: {
    categoria: Categoria;
  }[];
}

interface Autor {
  autor_key: string;
  nome: string;
  foto_url: string;
  qtd_trabalhos: number;
  livro_autor: {
    livro: Livro;
  }[];
}

const AutorPerfil = () => {
  const router = useRouter();
  const { autor_key } = useParams();
  const [autor, setAutor] = useState<Autor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { colorScheme } = useMantineColorScheme();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nome, setNome] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>('');

  useEffect(() => { const userString = localStorage.getItem('tipo'); if (userString === 'admin') { setIsAdmin(true); } else { setIsAdmin(false); } }, []);

  useEffect(() => {
    if (autor_key) {
      console.log(`Fetching autor with key: ${autor_key}`);
      const fetchAutor = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/autores/${autor_key}`);
          console.log('Autor data:', response.data);
          setAutor(response.data);
          setNome(response.data.nome);
          setFotoUrl(response.data.foto_url);
        } catch (error) {
          console.error('Erro ao buscar informações do autor:', error);
          setError("Erro ao buscar informações do autor.");
        } finally {
          setLoading(false);
        }
      };

      fetchAutor();
    } else {
      setLoading(false);
      setError("Autor key não encontrado.");
    }
  }, [autor_key]);

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:3001/autores/${autor_key}`, { nome, foto_url: fotoUrl });
      setIsEditing(false);
      router.push(`/autorInfo/${autor_key}`); // Reload the page to fetch updated information
    } catch (error) {
      console.error('Erro ao atualizar autor:', error);
      setError("Erro ao atualizar autor.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/autores/${autor_key}`);
      router.push('/autor'); // Redirect to the author list after deletion
    } catch (error) {
      console.error('Erro ao excluir autor:', error);
      setError("Erro ao excluir autor.");
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

  if (!autor) {
    return <Text>Autor não encontrado.</Text>;
  }

  const buttonColor = colorScheme === 'dark' ? 'white' : 'black';
  const buttonBgColor = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <Container mt="xl">
      <Group justify="space-between" className="h-full py-2 px-2">
        <Button variant="outline" onClick={() => router.push('/autor')} mb="md" color={buttonBgColor} style={{ color: buttonColor }}>
          <IconArrowLeft size={16} style={{ marginRight: 8 }} />
          Voltar
        </Button>
        <ColorSchemesSwitcher />
      </Group>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group align="flex-start" mb="md">
          <img src={autor.foto_url} alt={autor.nome} style={{ width: 150, height: 200 }} />
          <Stack gap="xs">
            {isEditing ? (
              <>
                <TextInput
                  label="Nome"
                  value={nome}
                  onChange={(event) => setNome(event.currentTarget.value)}
                />
                <TextInput
                  label="URL da Foto"
                  value={fotoUrl}
                  onChange={(event) => setFotoUrl(event.currentTarget.value)}
                />
                <Button onClick={handleEdit}>Salvar</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </>
            ) : (
              <>
                <Title order={2}>{autor.nome}</Title>
                <Text><strong>Quantidade de Trabalhos:</strong> {autor.qtd_trabalhos}</Text>
                <Text><strong>Livros:</strong> {autor.livro_autor?.map((la, index) => (
                  <span key={la.livro.livro_key} onClick={() => handleViewLivro(la.livro.livro_key)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                    {la.livro.titulo}{index < autor.livro_autor.length - 1 ? ', ' : ''}
                  </span>
                ))}</Text>
                <Text><strong>Categorias:</strong> {autor.livro_autor?.map((la) => la.livro.livro_categoria.map((lc) => lc.categoria.nome).join(", ")).join(", ")}</Text>
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

export default AutorPerfil;