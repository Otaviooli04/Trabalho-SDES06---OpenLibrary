import { useState } from "react";
import { Card, Text, Group, Avatar, Modal, Button, Textarea, Box, NumberInput } from "@mantine/core";
import { IconStar, IconEdit, IconTrash, IconMessageCircle } from '@tabler/icons-react';
import Image from "next/image";
import { format } from 'date-fns';
import axios from "axios";
import { ComentarioCard } from "../components/ComentarioCard";

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

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (review_id: number) => void;
  fetchReviews: () => void;
  currentUser: {
    usuario_id: number;
    isAdmin: boolean;
  };
  isUser?: boolean;
}


export function ReviewCard({ review, onEdit, onDelete, fetchReviews, currentUser, isUser }: ReviewCardProps) {
  const [opened, setOpened] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [isEditComentarioModalOpen, setIsEditComentarioModalOpen] = useState(false);
  const [editComentarioId, setEditComentarioId] = useState<number | null>(null);
  const [editComentarioText, setEditComentarioText] = useState<string>("");
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [editReviewText, setEditReviewText] = useState<string>(review.texto);
  const [editReviewNota, setEditReviewNota] = useState<number>(review.nota);

  const profileImageUrl = review.usuario.perfil[0]?.foto_url;

  const fetchComentarios = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/comentarios/${review.review_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComentarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      const comentarioData = {
        texto: comment,
        review_id: review.review_id,
      };

      await axios.post("http://localhost:3001/comentarios", comentarioData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComment("");
      fetchComentarios();
      fetchReviews(); // Atualizar a tela após enviar comentário
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    }
  };

  const handleEditComentario = (comentario: Comentario) => {
    setEditComentarioId(comentario.comentario_id);
    setEditComentarioText(comentario.texto);
    setIsEditComentarioModalOpen(true);
  };

  const handleUpdateComentario = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      if (!editComentarioId || !editComentarioText) {
        console.error("Todos os campos são obrigatórios.");
        return;
      }

      const comentarioData = {
        texto: editComentarioText,
      };

      await axios.put(`http://localhost:3001/comentarios/${editComentarioId}`, comentarioData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsEditComentarioModalOpen(false);
      setEditComentarioId(null);
      setEditComentarioText("");
      fetchComentarios();
      fetchReviews(); // Atualizar a tela após atualizar comentário
    } catch (error) {
      console.error("Erro ao atualizar comentário:", error);
    }
  };

  const handleDeleteComentario = async (comentario_id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      await axios.delete(`http://localhost:3001/comentarios/${comentario_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchComentarios();
      fetchReviews(); // Atualizar a tela após excluir comentário
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
    }
  };

  const handleUpdateReview = async () => {
    try {
      const token = localStorage.getItem("token");
      const usuario_id = localStorage.getItem("usuario_id");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      if (!editReviewText || !editReviewNota) {
        console.error("Todos os campos são obrigatórios.");
        return;
      }

      const reviewData = {
        texto: editReviewText,
        nota: editReviewNota,
        usuario_id: usuario_id
      };

      await axios.put(`http://localhost:3001/reviews/${review.review_id}`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsEditReviewModalOpen(false);
      setEditReviewText("");
      setEditReviewNota(0);
      if (onEdit) onEdit(review);
      fetchReviews(); // Atualizar a tela após atualizar review
    } catch (error) {
      console.error("Erro ao atualizar review:", error);
    }
  };

  const handleDeleteReview = async () => {
    try {
      const token = localStorage.getItem("token");
      const usuario_id = localStorage.getItem("usuario_id");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      if (!usuario_id) {
        console.error("Usuário não encontrado.");
        return;
      }

      await axios.delete(`http://localhost:3001/reviews/${review.review_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          usuario_id: usuario_id
        }
      });

      if (onDelete) onDelete(review.review_id);
      fetchReviews(); // Atualizar a tela após excluir review
    } catch (error) {
      console.error("Erro ao excluir review:", error);
    }
  };

  const renderStars = (nota: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <IconStar
          key={i}
          size={16}
          color={i < nota ? "gold" : "gray"}
          fill={i < nota ? "gold" : "none"}
        />
      );
    }
    return stars;
  };

  const toggleComentarios = () => {
    if (commentOpen) {
      setCommentOpen(false);
    } else {
      setCommentOpen(true);
      fetchComentarios();
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Perfil do Usuário"
      >
        <Group>
          <Avatar radius="xl">
            {profileImageUrl && (
              <Image
                src={profileImageUrl}
                alt={`${review.usuario.nome}'s profile picture`}
                width={80}
                height={80}
                style={{ borderRadius: '50%' }}
              />
            )}
          </Avatar>
          <div>
            <Text fw={500}>{review.usuario.nome}</Text>
            <Text size="xs" color="dimmed">
              {/* Adicione outras informações do usuário aqui */}
            </Text>
          </div>
        </Group>
      </Modal>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Group>
            <Avatar radius="xl" onClick={() => setOpened(true)} style={{ cursor: 'pointer' }}>
              {profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt={`${review.usuario.nome}'s profile picture`}
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%' }}
                />
              )}
            </Avatar>
            <div>
              <Text fw={500} onClick={() => setOpened(true)} style={{ cursor: 'pointer' }}>
                {review.usuario.nome}
              </Text>
            </div>
          </Group>
          <Text size="xs" color="dimmed">
            {format(new Date(review.data_criacao), 'dd/MM/yyyy')}
          </Text>
        </Group>
        <Text mt="sm">{review.texto}</Text>
        <Group gap={4} mt="xs">
          {renderStars(review.nota)}
        </Group>
        <Text size="md" color="dimmed" mt="xs">
          Livro: {review.livro.titulo}
        </Text>
        <Group mt="md" align="center" justify="space-between">
          <Button
            variant="outline"
            size="xs"
            onClick={toggleComentarios}
          >
            <Group gap={4}>
              <IconMessageCircle size={16} />
              <span>Comentar</span>
            </Group>
          </Button>
          {(isUser || (currentUser && currentUser.usuario_id === review.usuario.usuario_id || currentUser.isAdmin)) && (
            <>
              {(isUser || (currentUser.usuario_id === review.usuario.usuario_id)) && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsEditReviewModalOpen(true)}
                >
                  <Group gap={4}>
                    <IconEdit size={16} />
                    <span>Editar</span>
                  </Group>
                </Button>
              )}
              <Button
                variant="outline"
                size="xs"
                color="red"
                onClick={handleDeleteReview}
              >
                <Group gap={4}>
                  <IconTrash size={16} />
                  <span>Excluir</span>
                </Group>
              </Button>
            </>
          )}
        </Group>
        {commentOpen && (
          <>
            {comentarios.length > 0 ? (
              comentarios.map((comentario) => (
                <Box key={comentario.comentario_id} mt="md">
                  <ComentarioCard comentario={comentario} />
                  <Group justify="space-between">
                    <Group>
                      {currentUser.usuario_id === comentario.usuario.usuario_id && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleEditComentario(comentario)}
                        >
                          <IconEdit size={16} />
                        </Button>
                      )}
                      {(currentUser.usuario_id === comentario.usuario.usuario_id || currentUser.isAdmin) && (
                        <Button
                          variant="outline"
                          size="xs"
                          color="red"
                          onClick={() => handleDeleteComentario(comentario.comentario_id)}
                        >
                          <IconTrash size={16} />
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Box>
              ))
            ) : (
              <Text mt="xl" c="gray">Nenhum comentário ainda. Seja o primeiro a comentar!</Text>
            )}
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.currentTarget.value)}
              placeholder="Escreva seu comentário aqui..."
              minRows={4}
              mt="md"
            />
            <Button mt="md" onClick={handleCommentSubmit}>
              Enviar
            </Button>
          </>
        )}
      </Card>

      <Modal
        opened={isEditComentarioModalOpen}
        onClose={() => setIsEditComentarioModalOpen(false)}
        title="Editar Comentário"
      >
        <Textarea
          value={editComentarioText}
          onChange={(event) => setEditComentarioText(event.currentTarget.value)}
          placeholder="Edite seu comentário aqui..."
          minRows={4}
        />
        <Button mt="md" onClick={handleUpdateComentario}>
          Salvar
        </Button>
      </Modal>

      <Modal
        opened={isEditReviewModalOpen}
        onClose={() => setIsEditReviewModalOpen(false)}
        title="Editar Review"
      >
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
        <Button mt="md" onClick={handleUpdateReview}>
          Salvar
        </Button>
      </Modal>
    </>
  );
}