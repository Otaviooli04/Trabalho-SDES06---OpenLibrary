"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Text, Stack, Box } from "@mantine/core";
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import NavbarNested from "../components/Navbar";
import { ReviewCard } from "../components/ReviewCard";
import dynamic from "next/dynamic";

const Container = dynamic(() => import('@mantine/core').then(mod => mod.Container), { ssr: false });
const Group = dynamic(() => import('@mantine/core').then(mod => mod.Group), { ssr: false });
const AppShell = dynamic(() => import('@mantine/core').then(mod => mod.AppShell), { ssr: false });

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

export default function RegisterPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AppShell padding="md">
      <Group justify="right" className="h-full py-2 px-2">
        <ColorSchemesSwitcher />
      </Group>
      <NavbarNested />
      <Container size={600} my={40}>
        {error && <Text color="red">{error}</Text>}
        <Box>
          <Stack mt="xl">
            {reviews.map((review) => (
              <ReviewCard key={review.review_id} review={review} />
            ))}
          </Stack>
        </Box>
      </Container>
    </AppShell>
  );
}