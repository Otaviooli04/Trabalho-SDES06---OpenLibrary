"use client";
import { Group, ScrollArea, useMantineColorScheme } from '@mantine/core';
import Image from 'next/image';
import { UserButton } from './UserButton';
import { LinksGroup } from './NavBarLinksGroup';
import classes from './NavbarNested.module.css';
import Link from 'next/link';

const mockdata = [
  { label: 'Adicionar Review', icon: 'plus', href: '/add-review' },
  { label: 'Buscar Livros', icon: 'search', href: '/searchBooks' },
];

export default function NavbarNested() {
  const links = mockdata.map((item) => (
    <Link href={item.href} key={item.label} className={classes.link}>
      <LinksGroup {...item} />
    </Link>
  ));
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const logoSrc = isDark ? "/logo-dark.svg" : "/logo-light.svg";

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <UserButton />
      </div>
      <div className={classes.divider}></div>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>
      <div>
        <Group justify="space-between" className="h-full px-md">
          <Image
            src={logoSrc}
            alt="logo"
            width={100}
            height={100}
          />
        </Group>
      </div>
    </nav>
  );
}