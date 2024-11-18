"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { UnstyledButton, Group, Avatar, Text, rem, Menu } from '@mantine/core';
import { IconChevronRight, IconUser, IconLogout, IconSettings } from '@tabler/icons-react';
import classes from './UserButton.module.css';

interface User {
  nome: string;
  email: string;
  tipo: string;
  perfil: {
    foto_url: string;
  }[];
}

export function UserButton() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        setUser(response.data);
      } catch (error) {
        setError("Erro ao buscar informações do usuário.");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!user) {
    return <Text>Carregando...</Text>;
  }

  const profileImageUrl = user.perfil && user.perfil.length > 0 ? user.perfil[0].foto_url : '';

  return (
    <Menu shadow="md" width={200} position="right-start" offset={15}>
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <Avatar
              src={profileImageUrl}
              radius="xl"
            />

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text size="sm" fw={500}>
                  {user.nome}
                </Text>

                <Text c="dimmed" size="xs">
                  {user.email}
                </Text>
              </div>

              <IconChevronRight style={{ width: rem(16), height: rem(16), marginLeft: rem(8) }} stroke={1.5} />
            </div>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconUser size={14} />} onClick={() => router.push('/profile')}>Ver Perfil</Menu.Item>
        {user.tipo === 'admin' && (
          <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => router.push('/management')}>Administração</Menu.Item>
        )}
        <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleLogout}>Logout</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}