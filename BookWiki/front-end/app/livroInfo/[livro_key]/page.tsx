// app/livroInfo/[livro_key]/page.tsx

'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Title, Text, Loader, Card, Group, Stack, Button, useMantineColorScheme, TextInput } from '@mantine/core';
import { ColorSchemesSwitcher } from "../../components/color-schemes-switcher";
import { IconEdit, IconArrowLeft, IconTrash } from '@tabler/icons-react';

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
  review?: {
    review_id: number;
    texto: string;
    nota: number;
    data_criacao: string;
    usuario: {
      nome: string;
      perfil: {
        foto_url: string;
      }[];
    };
  }[];
}

const LivroPerfil = () => {
  const router = useRouter();
  const { livro_key } = useParams();
  const [livro, setLivro] = useState<Livro | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { colorScheme } = useMantineColorScheme();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [titulo, setTitulo] = useState<string>('');
  const [subtitulo, setSubtitulo] = useState<string>('');
  const [capaUrl, setCapaUrl] = useState<string>('');

  useEffect(() => {
    const userString = localStorage.getItem('tipo');
    if (userString === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (livro_key) {
      console.log(`Fetching livro with key: ${livro_key}`);
      const fetchLivro = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/livros/${livro_key}`);
          console.log('Livro data:', response.data);
          setLivro(response.data);
          setTitulo(response.data.titulo);
          setSubtitulo(response.data.subtitulo);
          setCapaUrl(response.data.capa_url);
        } catch (error) {
          console.error('Erro ao buscar informações do livro:', error);
          setError("Erro ao buscar informações do livro.");
        } finally {
          setLoading(false);
        }
      };

      fetchLivro();
    } else {
      setLoading(false);
      setError("Livro key não encontrado.");
    }
  }, [livro_key]);

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:3001/livros/${livro_key}`, { titulo, subtitulo, capa_url: capaUrl });
      setIsEditing(false);
     const fetchLivro = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/livros/${livro_key}`);
        console.log('Livro data:', response.data);
        setLivro(response.data);
        setTitulo(response.data.titulo);
        setSubtitulo(response.data.subtitulo);
        setCapaUrl(response.data.capa_url);
      } catch (error) {
        console.error('Erro ao buscar informações do livro:', error);
        setError("Erro ao buscar informações do livro.");
      } finally {
        setLoading(false);
      }
    };

    fetchLivro();


    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      setError("Erro ao atualizar livro.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/livros/${livro_key}`);
      router.push('/livro'); // Redirect to the book list after deletion
    } catch (error) {
      console.error('Erro ao excluir livro:', error);
      setError("Erro ao excluir livro.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!livro) {
    return <Text>Livro não encontrado.</Text>;
  }

  const buttonColor = colorScheme === 'dark' ? 'white' : 'black';
  const buttonBgColor = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <Container mt="xl">
      <Group justify="space-between" className="h-full py-2 px-2">
        <Button variant="outline" onClick={() => router.push('/livro')} mb="md" color={buttonBgColor} style={{ color: buttonColor }}>
          <IconArrowLeft size={16} style={{ marginRight: 8 }} />
          Voltar
        </Button>
        <ColorSchemesSwitcher />
      </Group>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group align="flex-start" mb="md">
          <img src={livro.capa_url} alt={livro.titulo} style={{ width: 150, height: 200 }} />
          <Stack gap="xs">
            {isEditing ? (
              <>
                <TextInput
                  label="Título"
                  value={titulo}
                  onChange={(event) => setTitulo(event.currentTarget.value)}
                />
                <TextInput
                  label="Subtítulo"
                  value={subtitulo}
                  onChange={(event) => setSubtitulo(event.currentTarget.value)}
                />
                <TextInput
                  label="URL da Capa"
                  value={capaUrl}
                  onChange={(event) => setCapaUrl(event.currentTarget.value)}
                />
                <Button onClick={handleEdit}>Salvar</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </>
            ) : (
              <>
                <Title order={2}>{livro.titulo}</Title>
                <Text>{livro.subtitulo}</Text>
                <Text><strong>Ano de Publicação:</strong> {livro.ano_publicacao}</Text>
                <Text><strong>Quantidade de Páginas:</strong> {livro.qtd_paginas}</Text>
                <Text><strong>Editora:</strong> {livro.editora.nome}</Text>
                <Text><strong>Linguagem:</strong> {livro.lingua.sigla}</Text>
                <Text><strong>Autores:</strong> {livro.livro_autor?.map((la) => la.autor?.nome).join(", ")}</Text>
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
        <Title order={3} mt="lg" mb="sm">Reviews</Title>
        {livro.review && livro.review.length > 0 ? (
          livro.review.map((review) => (
            <Card key={review.review_id} shadow="sm" padding="lg" radius="md" withBorder mb="md">
              <Group>
                <img src={review.usuario.perfil[0]?.foto_url} alt={review.usuario.nome} style={{ width: 50, height: 50, borderRadius: '50%' }} />
                <div>
                  <Text><strong>{review.usuario.nome}</strong></Text>
                  <Text>{review.texto}</Text>
                  <Text><strong>Nota:</strong> {review.nota}</Text>
                </div>
              </Group>
            </Card>
          ))
        ) : (
          <Text>Nenhuma review encontrada para este livro ainda, seja o primeiro!</Text>
        )}
      </Card>
    </Container>
  );
};

export default LivroPerfil;