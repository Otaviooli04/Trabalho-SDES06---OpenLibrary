"use client";
import { useState, useEffect } from "react";
import { ReviewCard } from '../components/ReviewCard';
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Container, Group, Avatar, Text, Button, Textarea, Card, Title, List, Loader, FileInput, Modal, NumberInput, TextInput, PasswordInput, useMantineTheme, useMantineColorScheme, Stack, ActionIcon, Select } from '@mantine/core';
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import { IconEdit, IconArrowLeft, IconTrash, IconSettings, IconBook } from '@tabler/icons-react';

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
interface ReadingGoal {
  goal_id: number;
  livro_key: string;
  meta: number;
  livro: {
    titulo: string;
    capa_url: string;
  };
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
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [success, setSuccess] = useState<string | null>(null);
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [readingGoal, setReadingGoal] = useState<number | null>(null);
  const [livros, setLivros] = useState<{ livro_key: string; titulo: string }[]>([]);
  const [readingGoals, setReadingGoals] = useState<ReadingGoal[]>([]);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [editGoalId, setEditGoalId] = useState<number | null>(null);
  

  const handleEditGoal = (goal: ReadingGoal) => {
    setSelectedBook(goal.livro_key);
    setReadingGoal(goal.meta);
    setEditGoalId(goal.goal_id);
    setIsEditGoalModalOpen(true);
  };
  

  useEffect(() => {
    if (isGoalModalOpen) {
      fetchLivros();
    }
  }, [isGoalModalOpen]);

  useEffect(() => {
    if (isEditGoalModalOpen) {
      fetchLivros();
    }
  }, [isEditGoalModalOpen]);

  

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
      setNewName(response.data.nome);
      setNewEmail(response.data.email);
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
    } catch (error) {
      setError("Erro ao buscar livros.");
    }
  };

  const fetchReadingGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      const response = await axios.get("http://localhost:3001/reading-goals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data && response.data.length > 0) {
        setReadingGoals(response.data);
      } else {
        setReadingGoals([]);
      }
    } catch (error) {
      setError("Erro ao buscar metas de leitura.");
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
    fetchReadingGoals();
  }, []);

  const handleUpdateGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      if (!selectedBook || !readingGoal) {
        setError("Todos os campos são obrigatórios.");
        return;
      }
  
      const goalData = {
        livro_key: selectedBook,
        meta: readingGoal,
      };
  
      await axios.put(`http://localhost:3001/reading-goals/${editGoalId}`, goalData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setIsEditGoalModalOpen(false);
      setSelectedBook("");
      setReadingGoal(null);
      setEditGoalId(null);
      fetchReadingGoals(); // Recarregar metas de leitura após atualizar
      setSuccess("Meta de leitura atualizada com sucesso!");
    } catch (error) {
      setError("Erro ao atualizar meta de leitura.");
    }
  };
  
  const handleDeleteGoal = async (goal_id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      await axios.delete(`http://localhost:3001/reading-goals/${goal_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      fetchReadingGoals(); // Recarregar metas de leitura após excluir
      setSuccess("Meta de leitura removida com sucesso!");
    } catch (error) {
      setError("Erro ao remover meta de leitura.");
    }
  };

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

  const handleAccountSave = async () => {
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
  
      // Atualizar nome
      if (newName && newName !== user?.nome) {
        await axios.put(`http://localhost:3001/users/${usuario_id}/nome`, { nome: newName }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
  
      // Atualizar email
      if (newEmail && newEmail !== user?.email) {
        await axios.put(`http://localhost:3001/users/${usuario_id}/email`, { email: newEmail }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
  
      // Atualizar senha
      if (newPassword) {
        const senhaAtual = prompt("Digite sua senha atual:");
        if (!senhaAtual) {
          setError("Senha atual é obrigatória para alterar a senha.");
          return;
        }
  
        await axios.put(`http://localhost:3001/users/${usuario_id}/senha`, { senhaAtual, novaSenha: newPassword }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
  
      // Recarregar informações do usuário
      await fetchUser();
      setIsAccountModalOpen(false);
      setSuccess("Informações da conta atualizadas com sucesso!");
    } catch (error) {
      setError("Erro ao atualizar informações da conta.");
    }
  };

  const handleSaveReadingGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }
  
      if (!selectedBook || !readingGoal) {
        setError("Todos os campos são obrigatórios.");
        return;
      }
  
      const goalData = {
        livro: selectedBook,
        meta: readingGoal,
      };
  
      await axios.post("http://localhost:3001/reading-goals", goalData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setIsGoalModalOpen(false);
      setSelectedBook("");
      setReadingGoal(null);
      setSuccess("Meta de leitura definida com sucesso!");
    } catch (error) {
      setError("Erro ao definir meta de leitura.");
    }
  };


  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!user) {
    return <Loader />;
  }
  const currentUser = {
    usuario_id: user?.usuario_id ?? 0,
    isAdmin: user?.tipo === "admin",
  };
  const buttonColor = colorScheme === 'dark' ? 'white' : 'black';
  const buttonBgColor = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <Container mt="xl">
      <Group justify="right" className="h-full py-2 px-2">
        <ColorSchemesSwitcher />
        <ActionIcon onClick={() => setIsAccountModalOpen(true)} color={buttonBgColor} style={{ color: buttonColor }}>
          <IconSettings size={16} />
        </ActionIcon>
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
        <Button onClick={() => setIsGoalModalOpen(true)} color={buttonBgColor} style={{ color: buttonColor }}>
          <IconBook size={14} style={{ marginRight: 8 }} />
          Definir Meta de Leitura
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

        <Title order={3} mt="lg" mb="sm">Metas de Leitura</Title>
        {readingGoals.length > 0 ? (
          <Group justify="center">
            {readingGoals.map((goal, index) => (
              <Card key={index} shadow="sm" padding="lg" radius="md" withBorder style={{ width: 200 }}>
                <Card.Section>
                  <img
                    src={goal.livro.capa_url}
                    alt={goal.livro.titulo}
                    style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
                    onClick={() => router.push(`/livroInfo/${goal.livro_key}`)}
                  />
                </Card.Section>
                <Text fw={500} mt="md">{goal.livro.titulo}</Text>
                <Text size="sm" color="dimmed">{goal.meta} páginas por dia</Text>
                <Group mt="md">
                  <Button onClick={() => handleEditGoal(goal)} color={buttonBgColor} style={{ color: buttonColor }}>
                    <IconEdit size={14} />
                  </Button>
                  <Button onClick={() => handleDeleteGoal(goal.goal_id)} color="red">
                    <IconTrash size={14} />
                  </Button>
                </Group>
              </Card>
            ))}
          </Group>
        ) : (
          <Text color="dimmed">Nenhuma meta de leitura encontrada.</Text>
        )}
        <Title order={3} mt="lg" mb="sm">Reviews</Title>
        {reviews.length > 0 ? (
          <div>
            {reviews.map((review, index) => (
              <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                <ReviewCard
                    key={review.review_id}
                    review={review}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                    fetchReviews={fetchReviews}
                    currentUser={currentUser}
                    isUser={true}
                  />
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
          <Modal opened={isEditGoalModalOpen} onClose={() => setIsEditGoalModalOpen(false)} title="Editar Meta de Leitura">
      <Stack>
        <NumberInput
          label="Meta de Leitura (páginas por dia)"
          value={readingGoal ?? undefined}
          onChange={(value) => setReadingGoal(value as number)}
          placeholder="Digite a meta de leitura"
          min={1}
        />
        <Button onClick={handleUpdateGoal} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>Salvar</Button>
      </Stack>
    </Modal>

      <Modal opened={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Definir Meta de Leitura">
      <Stack>
        <Select
          label="Livro"
          placeholder="Selecione um livro"
          data={livros.map((livro) => ({ value: livro.livro_key, label: livro.titulo }))}
          value={selectedBook}
          onChange={(value) => setSelectedBook(value ?? "")}
        />
        <NumberInput
          label="Meta de Leitura (páginas por dia)"
          value={readingGoal ?? undefined}
          onChange={(value) => setReadingGoal(value as number)}
          placeholder="Digite a meta de leitura"
          min={1}
        />
        <Button onClick={handleSaveReadingGoal} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: 'none' }}>Salvar</Button>
      </Stack>
    </Modal>

      <Modal opened={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="Gerenciar Conta">
  <Stack>
    <TextInput
      label="Nome"
      value={newName}
      onChange={(event) => setNewName(event.currentTarget.value)}
      placeholder="Digite seu nome"
    />
    <TextInput
      label="Email"
      value={newEmail}
      onChange={(event) => setNewEmail(event.currentTarget.value)}
      placeholder="Digite seu email"
    />
    <PasswordInput
      label="Senha Atual"
      value={currentPassword}
      onChange={(event) => setCurrentPassword(event.currentTarget.value)}
      placeholder="Digite sua senha atual"
    />
    <PasswordInput
      label="Nova Senha"
      value={newPassword}
      onChange={(event) => setNewPassword(event.currentTarget.value)}
      placeholder="Digite sua nova senha"
    />
    <Button onClick={handleAccountSave} variant="outline" color={buttonBgColor} style={{ color: buttonColor, border: '0' }}>Salvar</Button>
  </Stack>
</Modal>
    </Container>
  );
}