"use client";
import { useState } from "react";
import axios from "axios";
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  AppShell,
  AppShellHeader,
  AppShellMain,
  Container,
  Group,
  Button,
  useMantineColorScheme,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import { ColorSchemesSwitcher } from "../components/color-schemes-switcher";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize useRouter
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const logoSrc = isDark ? "/logo-dark.svg" : "/logo-light.svg";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        senha: password,
      });
      const { token } = response.data;
      const { usuario_id } = response.data;
      const { tipo } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("usuario_id", usuario_id);
      localStorage.setItem("tipo", tipo);
      router.push("/menu"); // Redirect to the menu page
    } catch (error) {
      setError("Email ou senha incorretos.");
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
            Bem vindo!!
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            Ainda não tem uma conta?{" "}
            <Link href="/register" passHref>
              <Anchor size="sm" component="button">
                Cadastre-se
              </Anchor>
            </Link>
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <form onSubmit={handleSubmit}>
              <TextInput
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
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
                Entrar
              </Button>
            </form>
          </Paper>
        </Container>
      </AppShellMain>
    </AppShell>
  );
}