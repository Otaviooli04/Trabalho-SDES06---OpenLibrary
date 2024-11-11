"use client";

import { useMantineColorScheme, ActionIcon, Group } from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons-react";

export function ColorSchemesSwitcher() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Group align="flex-end">
      <ActionIcon
        variant="outline"
        color={dark ? "yellow" : "blue"}
        onClick={() => toggleColorScheme()}
        title="Toggle color scheme"
      >
        {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
      </ActionIcon>
    </Group>
  );
}