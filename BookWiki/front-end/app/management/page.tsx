"use client";
import { useState } from "react";
import axios from "axios";
import { Text, Stack, Box, Button, Select } from "@mantine/core";
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import NavbarNested from "../components/Navbar";
import dynamic from "next/dynamic";

const Container = dynamic(() => import('@mantine/core').then(mod => mod.Container), { ssr: false });
const Group = dynamic(() => import('@mantine/core').then(mod => mod.Group), { ssr: false });
const AppShell = dynamic(() => import('@mantine/core').then(mod => mod.AppShell), { ssr: false });

export default function RegisterPage() {
  const [nomeLivro, setNomeLivro] = useState("");
  interface Livro {
    key: string;
    title: string;
    subtitle: string;
    first_publish_year: number;
    number_of_pages_median: number;
    cover_i?: number;
    publisher: string[];
    language: string[];
  }

  const [livros, setLivros] = useState<Livro[]>([]);
  const [selectedLivro, setSelectedLivro] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchLivros = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/buscar-livros?nomeLivro=${nomeLivro}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLivros(response.data);
      setError(null);
    } catch (error) {
      setError("Erro ao buscar livros.");
      console.error("Erro ao buscar livros:", error);
    }
  };

  const registerLivro = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado.");
        return;
      }

      const livro = livros.find(l => l.key === selectedLivro);
      if (!livro) {
        setError("Livro não encontrado.");
        return;
      }

      const response = await axios.post("http://localhost:3001/livros", {
        livro_key: livro.key,
        titulo: livro.title,
        subtitulo: livro.subtitle,
        ano_publicacao: livro.first_publish_year,
        qtd_paginas: livro.number_of_pages_median,
        capa_url: livro.cover_i ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-L.jpg` : null,
        editora_nome: livro.publisher[0],
        lingua_sigla: livro.language[0],
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Livro registrado com sucesso.");
      setError(null);
    } catch (error) {
      setError("Erro ao registrar livro.");
      console.error("Erro ao registrar livro:", error);
    }
  };

  return (
    <AppShell padding="md">
      <Group justify="right" className="h-full py-2 px-2">
        <ColorSchemesSwitcher />
      </Group>
      <NavbarNested />
      <Container size={600} my={40}>
        {error && <Text color="red">{error}</Text>}
        {success && <Text color="green">{success}</Text>}
        <Box>
          <Stack mt="xl">
            <input
              type="text"
              value={nomeLivro}
              onChange={(e) => setNomeLivro(e.target.value)}
              placeholder="Digite o nome do livro"
            />
            <Button onClick={fetchLivros}>Buscar Livros</Button>
            {livros.length > 0 && (
              <Select
                label="Selecione um livro"
                placeholder="Escolha um livro"
                data={livros.map(livro => ({ value: livro.key, label: livro.title }))}
                value={selectedLivro}
                onChange={(value) => setSelectedLivro(value)}
              />
            )}
            {selectedLivro && <Button onClick={registerLivro}>Registrar Livro</Button>}
          </Stack>
        </Box>
      </Container>
    </AppShell>
  );
}