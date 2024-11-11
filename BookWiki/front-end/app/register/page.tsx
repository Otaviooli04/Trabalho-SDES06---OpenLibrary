"use client";
import { useState } from "react";
import axios from "axios";
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Group,
  AppShell,
  AppShellHeader,
  AppShellMain,
  Button,
  Anchor,
  useMantineColorScheme,
} from "@mantine/core";
import Link from "next/link";
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import Image from "next/image";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const logoSrc = isDark ? "/logo-dark.svg" : "/logo-light.svg";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/register", {
        nome: name,
        email,
        senha: password,
      });
      toast.success(response.data.message || "Usuário criado com sucesso!");
    } catch (error) {
      setError("Erro ao cadastrar usuário.");
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.error || "Erro ao cadastrar usuário.");
      } else {
        toast.error("Erro ao cadastrar usuário.");
      }
    }
  };

  return (
    <AppShell header={{ height: 80 }} padding="md">
      <AppShellHeader>
        <Group justify="space-between" className="h-full px-md">
          <Image
            src={logoSrc}
            alt="logo"
            width={100}
            height={100}
          />
          <ColorSchemesSwitcher />
        </Group>
      </AppShellHeader>
      <AppShellMain>
    <Container size={420} my={40}>
      <Title ta="center" className="font-bold text-2xl">
        Cadastre-se
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Já tem uma conta?{" "}
        <Link href="/login" passHref>
          <Anchor size="sm" component="button">
            Entrar
          </Anchor>
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Nome"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            required
          />
          <TextInput
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            mt="md"
          />
          <PasswordInput
            label="Password"
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            mt="md"
          />
          {error && (
            <Text color="red" size="sm" mt="md">
              {error}
            </Text>
          )}
          <Button type="submit" fullWidth mt="xl">
            Registrar
          </Button>
        </form>
      </Paper>
    </Container>
    </AppShellMain>
    </AppShell>
  );
}