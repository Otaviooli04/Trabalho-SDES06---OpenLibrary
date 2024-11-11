"use client";
import { ColorSchemesSwitcher } from "./components/color-schemes-switcher";
import AuthenticationTitle from "./login/page";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
  useMantineColorScheme,
} from "@mantine/core";
import Image from "next/image";


export default function Home() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const logoSrc = isDark ? "/logo-dark.svg" : "/logo-light.svg";

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
        <div className="flex justify-center mt-10">
          <AuthenticationTitle />
        </div>
      </AppShellMain>
    </AppShell>
  );
}