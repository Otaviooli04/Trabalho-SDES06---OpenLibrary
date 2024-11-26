"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import axios from "axios";
import { Text, Stack, Box, Textarea, Button, Group, Select, NumberInput, Container, AppShell, Modal, Notification } from "@mantine/core";
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import NavbarNested from "../components/Navbar";
import { ReviewCard } from "../components/ReviewCard";
import { ComentarioCard } from "../components/ComentarioCard";
import dynamic from "next/dynamic";
import { debounce } from "lodash";
import { useMantineColorScheme } from '@mantine/core';
import  {IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

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
      perfil_id: number;
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
    usuario_id: number;
    nome: string;
    perfil: {
      foto_url: string;
    }[];
  };
  review: {
    review_id: number;
  };
}

interface Usuario {
  usuario_id: number;
  nome: string;
  email: string;
  tipo: string;
  perfil: {
    perfil_id: number;
    bio: string;
    foto_url: string;
  };
}

export default function RegisterPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [comentarios, setComentarios] = useState<{ [key: number]: Comentario[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newReview, setNewReview] = useState<string>("");
  const [selectedLivro, setSelectedLivro] = useState<string | null>(null);
  const [nota, setNota] = useState<number | null>(null);
  const [newComentario, setNewComentario] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState<number | null>(null);
  const [editReviewText, setEditReviewText] = useState<string>("");
  const [editReviewNota, setEditReviewNota] = useState<number | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isEditComentarioModalOpen, setIsEditComentarioModalOpen] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const [editComentarioText, setEditComentarioText] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visibleComentarios, setVisibleComentarios] = useState<Record<number, boolean>>({});
  const fetchUsuario = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        router.push("/login"); // Redirecionar para a página de login
        return;
      }

      const response = await axios.get("http://localhost:3001/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsuario(response.data);
    } catch (error) {
      setError("Erro ao buscar perfil do usuário.");
      router.push("/login"); // Redirecionar para a página de login
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        router.push("/login"); // Redirecionar para a página de login
        return;
      }

      const response = await axios.get("http://localhost:3001/reviews/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ordenar reviews do mais novo para o mais velho
      const sortedReviews = response.data.sort((a: Review, b: Review) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());

      setReviews(sortedReviews);
    } catch (error) {
      setError("Erro ao buscar reviews.");
      router.push("/login"); // Redirecionar para a página de login
    }
  };

  useEffect(() => {
    fetchUsuario();
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
      setLivros([]); // Limpar a lista de livros
      fetchReviews(); // Recarregar reviews após enviar
      setSuccess("Review enviada com sucesso!");
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
      setSuccess("Comentário enviado com sucesso!");
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
      fetchComentarios(review_id); // Supondo que `review_id` é number
    }
  };
  const handleEditReview = (review: Review) => {
    setEditReviewId(review.review_id);
    setEditReviewText(review.texto);
    setEditReviewNota(review.nota);
    setIsEditModalOpen(true);
  };

  const handleDeleteReview = async (review_id: number) => {
    try {
      const token = localStorage.getItem("token");
      const usuario_id = localStorage.getItem("usuario_id");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      if (!usuario_id) {
        setError("Usuário não encontrado.");
        return;
      }
  
      console.log("Enviando usuario_id:", usuario_id); // Adicione este console.log
      console.log("Enviando review_id:", review_id); // Adicione este console.log
  
      await axios.delete(`http://localhost:3001/reviews/${review_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          usuario_id: usuario_id
        }
      });
  
      fetchReviews(); // Recarregar reviews após excluir
      setSuccess("Review excluída com sucesso!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      setError("Erro ao excluir review.");
    }
  };
  
  const handleUpdateReview = async () => {
    try {
      const token = localStorage.getItem("token");
      const usuario_id = localStorage.getItem("usuario_id");
      console.log("Enviando usuario_id:", usuario_id); // Adicione este console.log
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      if (!editReviewId || !editReviewText || !editReviewNota) {
        return;
      }
  
      const reviewData = {
        texto: editReviewText,
        nota: editReviewNota,
        usuario_id: usuario_id
      };
  
      await axios.put(`http://localhost:3001/reviews/${editReviewId}`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setIsEditModalOpen(false);
      setEditReviewId(null);
      setEditReviewText("");
      setEditReviewNota(null);
      fetchReviews(); // Recarregar reviews após atualizar
      setSuccess("Review atualizada com sucesso!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      setError("Erro ao atualizar review.");
    }
  };
  const [editComentarioId, setEditComentarioId] = useState<number | null>(null);

  const handleUpdateComentario = async () => {
    try {
      const token = localStorage.getItem("token");
      const usuario_id = localStorage.getItem("usuario_id");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      if (!editComentarioId || !editComentarioText) {
        return;
      }
      setComentarios((prev) => {
        const updatedComentarios = { ...prev };
        const reviewId = Object.keys(updatedComentarios).find((key) =>
          updatedComentarios[Number(key)].some((comentario) => comentario.comentario_id === editComentarioId)
        );
  
        if (reviewId) {
          const reviewIdNumber = Number(reviewId);
          updatedComentarios[reviewIdNumber] = updatedComentarios[reviewIdNumber].map((comentario) =>
            comentario.comentario_id === editComentarioId
              ? { ...comentario, texto: editComentarioText }
              : comentario
          );
        }
  
        return updatedComentarios;
      });
      const comentarioData = {
        texto: editComentarioText,
        usuario_id: usuario_id
      };
  
      await axios.put(`http://localhost:3001/comentarios/${editComentarioId}`, comentarioData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setIsEditComentarioModalOpen(false);
      setEditComentarioId(null);
      setEditComentarioText("");
  
      // Recarregar comentários da review correspondente
      const comentario = comentarios[editComentarioId];
      if (comentario) {
        fetchComentarios(comentario[0].review.review_id);
      }
      setSuccess("Comentário atualizado com sucesso!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      setError("Erro ao atualizar comentário.");
    }
  };

  const currentUser = {
    usuario_id: usuario?.usuario_id ?? 0,
    isAdmin: usuario?.tipo === "admin",
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
        {error && (
          <Notification icon={<IconX size="1.1rem" />} color="red" onClose={() => setError(null)}>
            {error}
          </Notification>
        )}
        {success && (
          <Notification icon={<IconCheck size="1.1rem" />} color="green" onClose={() => setSuccess(null)}>
            {success}
          </Notification>
        )}
        <Box>
        <Group flex="column" align="flex-start" style={{ width: '100%' }}>
        <Text>Escreva sua review</Text>
        <Textarea
          value={newReview}
          onChange={(event) => setNewReview(event.currentTarget.value)}
          placeholder="Escreva sua review aqui..."
          minRows={3}
          style={{ width: '100%' }}
        />
        <Group style={{ width: '100%' }} grow>
          <div style={{ flex: 1 }}>
            <Text>Escolha um livro</Text>
            <Select
              data={livros.map((livro) => ({ value: livro.livro_key, label: livro.titulo }))}
              placeholder="Selecione um livro"
              value={selectedLivro}
              onChange={setSelectedLivro}
              onSearchChange={handleSearchChange}
              searchable
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Text>Avalie</Text>
            <NumberInput
              value={nota ?? undefined}
              onChange={(value) => setNota(value as number)}
              placeholder="Nota"
              min={0}
              max={5}
              style={{ width: '100%' }}
            />
          </div>
        </Group>
        <Group align="center" justify="center" style={{ width: '100%', marginTop: '10px' }}>
          <Button onClick={handleSubmit} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>Enviar</Button>
        </Group>
      </Group>
          <Stack mt="xl">
            {reviews.map((review) => (
              <Box key={review.review_id}>
                <ReviewCard
                    key={review.review_id}
                    review={review}
                    onEdit={handleUpdateReview}
                    onDelete={handleDeleteReview}
                    fetchReviews={fetchReviews}
                    currentUser={currentUser}
                  />
                {visibleComentarios[review.review_id] && (
  <>
            {(Array.isArray(comentarios[review.review_id]) ? comentarios[review.review_id] : []).map((comentario) => (
              <Box key={comentario.comentario_id}>
                <ComentarioCard comentario={comentario} />
              </Box>
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

      <Modal opened={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Review">
        <Stack>
          <Textarea
            value={editReviewText}
            onChange={(event) => setEditReviewText(event.currentTarget.value)}
            placeholder="Edite sua review aqui..."
            minRows={6}
          />
          <NumberInput
            value={editReviewNota ?? undefined}
            onChange={(value) => setEditReviewNota(value as number)}
            placeholder="Nota"
            min={0}
            max={5}
          />
          <Button onClick={handleUpdateReview} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>Salvar</Button>
        </Stack>
      </Modal>
      <Modal opened={isEditComentarioModalOpen} onClose={() => setIsEditComentarioModalOpen(false)} title="Editar Comentário">
      <Stack>
    <Textarea
      value={editComentarioText}
      onChange={(event) => setEditComentarioText(event.currentTarget.value)}
      placeholder="Edite seu comentário aqui..."
      minRows={3}
    />
    <Button onClick={handleUpdateComentario} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>Salvar</Button>
  </Stack>
</Modal>
    </DynamicAppShell>
  );
}