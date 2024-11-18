"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Text, Stack, Box, Textarea, Button, Group, Select, NumberInput, Container, AppShell } from "@mantine/core";
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import NavbarNested from "../components/Navbar";
import { ReviewCard } from "../components/ReviewCard";
import { ComentarioCard } from "../components/ComentarioCard";
import dynamic from "next/dynamic";
import { debounce } from "lodash";
import { useMantineColorScheme } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';

const DynamicContainer = dynamic(() => import('@mantine/core').then(mod => mod.Container), { ssr: false });
const DynamicAppShell = dynamic(() => import('@mantine/core').then(mod => mod.AppShell), { ssr: false });

interface Review {
  review_id: number;
  texto: string;
  nota: number;
  data_criacao: string;
  usuario: {
    usuario_id: number;
    nome: string;
    perfil: {
      foto_url: string;
    }[];
  };
  livro: {
    titulo: string;
  };
}

interface Livro {
  livro_key: string;
  titulo: string;
}

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

export default function RegisterPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [comentarios, setComentarios] = useState<{ [key: number]: Comentario[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState<string>("");
  const [selectedLivro, setSelectedLivro] = useState<string | null>(null);
  const [nota, setNota] = useState<number | null>(null);
  const [newComentario, setNewComentario] = useState<string>("");
  const [visibleComentarios, setVisibleComentarios] = useState<{ [key: number]: boolean }>({});
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token não encontrado.");
          return;
        }

        const response = await axios.get("http://localhost:3001/reviews/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setReviews(response.data);
      } catch (error) {
        setError("Erro ao buscar reviews.");
      }
    };

    fetchReviews();
  }, []);

  const fetchLivros = useCallback(
    debounce(async (query: string) => {
      try {
        const response = await axios.get(`http://localhost:3001/livros?search=${query}`);
        setLivros(response.data);
      } catch (error) {
        setError("Erro ao buscar livros.");
      }
    }, 300),
    []
  );

  const fetchComentarios = async (review_id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/comentarios/${review_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComentarios((prev) => ({
        ...prev,
        [review_id]: response.data,
      }));
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      setError("Erro ao buscar comentários.");
    }
  };

  const handleSearchChange = (query: string) => {
    if (query.length > 2) {
      fetchLivros(query);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      if (!selectedLivro || !nota) {
        setError("Livro e nota são obrigatórios.");
        return;
      }

      const reviewData = {
        texto: newReview,
        nota,
        livro_key: selectedLivro,
      };

      

      await axios.post("http://localhost:3001/reviews", reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNewReview("");
      setSelectedLivro(null);
      setNota(null);
      const response = await axios.get("http://localhost:3001/reviews/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReviews(response.data);
      
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      setError("Erro ao enviar review.");
    }
  };

  const handleComentarioSubmit = async (review_id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      if (!newComentario || !review_id) {
        setError("Comentário e ID da review são obrigatórios.");
        return;
      }

      const comentarioData = {
        texto: newComentario,
        review_id,
      };

      console.log("Dados do comentário a serem enviados:", comentarioData);

      await axios.post("http://localhost:3001/comentarios", comentarioData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNewComentario("");
      fetchComentarios(review_id);
      console.log("Comentário enviado com sucesso.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      setError("Erro ao enviar comentário.");
    }
  };

  const toggleComentarios = (review_id: number) => {
    setVisibleComentarios((prev) => ({
      ...prev,
      [review_id]: !prev[review_id],
    }));
    if (!visibleComentarios[review_id]) {
      fetchComentarios(review_id);
    }
  };

  const buttonColor = colorScheme === 'dark' ? 'white' : 'black';
  const buttonBgColor = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <DynamicAppShell padding="md">
      <Group justify="right" className="h-full py-2 px-2">
        <ColorSchemesSwitcher />
      </Group>
      <NavbarNested />
      
      <DynamicContainer size={600} my={40}>
        {error && <Text color="red">{error}</Text>}
        <Box>
          <Group align="flex-end">
            <Textarea
              value={newReview}
              onChange={(event) => setNewReview(event.currentTarget.value)}
              placeholder="Escreva sua review aqui..."
              minRows={6}
              style={{ flex: 1 }}
            />
            <Select
              data={livros.map((livro) => ({ value: livro.livro_key, label: livro.titulo }))}
              placeholder="Selecione um livro"
              value={selectedLivro}
              onChange={setSelectedLivro}
              onSearchChange={handleSearchChange}
              searchable
              style={{ flex: 1 }}
            />
            <NumberInput
              value={nota ?? undefined}
              onChange={(value) => setNota(value as number)}
              placeholder="Nota"
              min={0}
              max={5}
              style={{ flex: 1 }}
            />
            <Button onClick={handleSubmit} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>Enviar</Button>
          </Group>
          <Stack mt="xl">
            {reviews.map((review) => (
              <Box key={review.review_id}>
                <ReviewCard review={review} />
                <Button onClick={() => toggleComentarios(review.review_id)} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>
                  <IconMessageCircle size={16} style={{ marginRight: 8 }} />
                </Button>
                {visibleComentarios[review.review_id] && (
                  <>
                    {(Array.isArray(comentarios[review.review_id]) ? comentarios[review.review_id] : []).map((comentario) => (
                      <ComentarioCard key={comentario.comentario_id} comentario={comentario} />
                    ))}
                    <Textarea
                      value={newComentario}
                      onChange={(event) => setNewComentario(event.currentTarget.value)}
                      placeholder="Escreva seu comentário aqui..."
                      minRows={3}
                      style={{ flex: 1 }}
                    />
                    <Button onClick={() => handleComentarioSubmit(review.review_id)} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>Enviar Comentário</Button>
                  </>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      </DynamicContainer>
    </DynamicAppShell>
  );
}