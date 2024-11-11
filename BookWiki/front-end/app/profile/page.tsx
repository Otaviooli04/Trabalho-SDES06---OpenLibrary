"use client";
import { useState, useEffect } from "react";
import { ReviewCard } from '../components/ReviewCard';
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Container, Group, Avatar, Text, Button, Textarea, Card, Title, List, Loader, FileInput, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import { IconEdit, IconArrowLeft } from '@tabler/icons-react';

interface User {
  nome: string;
  email: string;
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
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
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
  
        console.log("Resposta do backend:", response.data); // Log da resposta do backend
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
  
    fetchUser();
    fetchListas();
    fetchReviews();
  }, []);

  const handleBioSave = async () => {
    console.log("Salvando bio...");
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
      console.log("Perfil ID:", user.perfil[0].perfil_id);
      const formData = new FormData();
      formData.append("perfil_id", user.perfil[0].perfil_id.toString());
      console.log("New bio:", newBio);
      

      if (newBio !== user.perfil[0].bio) {
        console.log("Adicionando bio ao formData...");
        formData.append("bio", newBio);
      }

      if (newPhoto) {
        console.log("Adicionando foto ao formData...");
        formData.append("foto", newPhoto);
      }
      console.log("Enviando formData:", formData);
      console.log("dados do formdata", formData.get("perfil_id"));
      console.log("dados do formdata", formData.get("bio"));
      console.log("dados do formdata", formData.get("foto"));
      const response = await axios.put("http://localhost:3001/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data);
      console.log("Resposta do backend:", response.data);
      setIsEditingBio(false);
    } catch (error) {
      setError("Erro ao atualizar o perfil.");
    }
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
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        ) : (
          <Text color="dimmed">Nenhuma review encontrada.</Text>
        )}
      </Card>
    </Container>
  );
}