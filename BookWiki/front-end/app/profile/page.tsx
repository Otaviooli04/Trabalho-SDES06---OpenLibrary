"use client";
import { useState, useEffect } from "react";
import { ReviewCard } from '../components/ReviewCard';
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Container, Group, Avatar, Text, Button, Textarea, Card, Title, List, Loader, FileInput, Modal, NumberInput, useMantineTheme, useMantineColorScheme, Stack } from '@mantine/core';
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import { IconEdit, IconArrowLeft, IconTrash } from '@tabler/icons-react';

interface User {
  usuario_id: number;
  nome: string;
  email: string;
  tipo: string;
  perfil: {
    foto_url: string;
    bio: string;
    perfil_id: number;
  }[];
}

interface Lista {
  lista_id: number;
  nome_lista: string;
  data_criacao: string;
}

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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [listas, setListas] = useState<Lista[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState<number | null>(null);
  const [editReviewText, setEditReviewText] = useState<string>("");
  const [editReviewNota, setEditReviewNota] = useState<number | null>(null);
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

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
      setNewBio(response.data.perfil[0].bio);
    } catch (error) {
      setError("Erro ao buscar informações do usuário.");
    }
  };

  const fetchListas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get("http://localhost:3001/profile/lists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setListas(response.data);
    } catch (error) {
      setError("Erro ao buscar listas.");
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get("http://localhost:3001/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews(response.data);
    } catch (error) {
      setError("Erro ao buscar reviews.");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchListas();
    fetchReviews();
  }, []);

  const handleBioSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      if (!user || !user.perfil || !user.perfil[0]) {
        setError("Informações do perfil não encontradas.");
        return;
      }
      
      const formData = new FormData();
      formData.append("perfil_id", user.perfil[0].perfil_id.toString());

      if (newBio !== user.perfil[0].bio) {
        formData.append("bio", newBio);
      }

      if (newPhoto) {
        formData.append("foto", newPhoto);
      }
      
      const response = await axios.put("http://localhost:3001/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data);
      setIsEditingBio(false);
    } catch (error) {
      setError("Erro ao atualizar o perfil.");
    }
  };

  const handleEditReview = (review: Review) => {
    setEditReviewId(review.review_id);
    setEditReviewText(review.texto);
    setEditReviewNota(review.nota);
    setIsEditModalOpen(true);
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
        setError("Todos os campos são obrigatórios.");
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

  const handleEditIcon = (review: Review) => {
    console.log("localStorage.usuario_id:", localStorage.getItem("usuario_id"));
    console.log('id do usuario:', user?.usuario_id);
    console.log("localStorage.usuario_id:", localStorage.getItem("usuario_id"));
    const usuario_id = localStorage.getItem("usuario_id");
    return usuario_id && usuario_id === user?.usuario_id.toString();
  };

  const handleTrashIcon = (review: Review) => {
    const usuario_id = localStorage.getItem("usuario_id");
    return usuario_id && (usuario_id === user?.usuario_id.toString() || user?.tipo === 'admin');
  };

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
      </Group>
      <Button variant="outline" onClick={() => router.push('/menu')} mb="md" color={buttonBgColor} style={{ color: buttonColor }}>
        <IconArrowLeft size={16} style={{ marginRight: 8 }} />
        Voltar para o Menu
      </Button>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <Avatar src={user.perfil?.[0]?.foto_url} size="xl" radius="xl" />
            <div>
              <Title order={2}>{user.nome}</Title>
              <Text color="dimmed">{user.email}</Text>
            </div>
          </Group>
          <Button onClick={() => setIsEditingBio(!isEditingBio)} color={buttonBgColor} style={{ color: buttonColor }}>
            <IconEdit size={14} style={{ marginRight: 8 }} />
            Editar Perfil
          </Button>
        </Group>

        <Title order={3} mb="sm">Bio</Title>
        {isEditingBio ? (
          <div>
            <Textarea
              value={newBio}
              onChange={(event) => setNewBio(event.currentTarget.value)}
              placeholder="Digite sua bio"
              minRows={4}
            />
            <FileInput
              placeholder="Selecione uma nova foto"
              onChange={(file) => setNewPhoto(file)}
              accept="image/*"
            />
            <Group mt="sm">
              <Button onClick={handleBioSave} color={buttonBgColor} style={{ color: buttonColor }}>Salvar</Button>
              <Button variant="outline" onClick={() => setIsEditingBio(false)} color={buttonBgColor} style={{ color: buttonColor }}>Cancelar</Button>
            </Group>
          </div>
        ) : (
          <Text>{user.perfil[0].bio}</Text>
        )}

        <Title order={3} mt="lg" mb="sm">Listas de Livros</Title>
        {listas.length > 0 ? (
          <List>
            {listas.map((lista, index) => (
              <List.Item key={index}>{lista.nome_lista}</List.Item>
            ))}
          </List>
        ) : (
          <Text color="dimmed">Nenhuma lista de livros encontrada.</Text>
        )}

        <Title order={3} mt="lg" mb="sm">Reviews</Title>
        {reviews.length > 0 ? (
          <div>
            {reviews.map((review, index) => (
              <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                <ReviewCard review={review} />
                <Group>
                  {handleEditIcon(review) && (
                    <Button onClick={() => handleEditReview(review)} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>
                      <IconEdit size={16} style={{ marginRight: 8 }} />
                    </Button>
                  )}
                  {handleTrashIcon(review) && (
                    <Button onClick={() => handleDeleteReview(review.review_id)} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>
                      <IconTrash size={16} style={{ marginRight: 8 }} />
                    </Button>
                  )}
                </Group>
              </Card>
            ))}
          </div>
        ) : (
          <Text color="dimmed">Nenhuma review encontrada.</Text>
        )}
      </Card>

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
    </Container>
  );
}