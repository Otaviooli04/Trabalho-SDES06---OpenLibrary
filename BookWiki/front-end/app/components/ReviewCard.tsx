"use client";
import { useState } from "react";
import { Card, Text, Group, Avatar, Modal, Button, Textarea } from "@mantine/core";
import Image from "next/image";

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

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [opened, setOpened] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");

  const profileImageUrl = review.usuario.perfil[0]?.foto_url;

  const handleCommentSubmit = () => {
    // Lógica para enviar o comentário
    setComment("");
    setCommentOpen(false);
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
            <Text size="xs" color="dimmed">
              {new Date(review.data_criacao).toLocaleDateString()}
            </Text>
          </div>
        </Group>
        <Text mt="sm">{review.texto}</Text>
        <Text size="xs" color="dimmed">
          Nota: {review.nota} - Livro: {review.livro.titulo}
        </Text>
      </Card>
    </>
  );
}