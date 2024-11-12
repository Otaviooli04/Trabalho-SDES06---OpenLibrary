"use client";
import { useState } from 'react';
import React from 'react';
import * as lucideIcons from 'lucide-react';

interface LinksGroupProps {
  icon: string;
  label: string;
  links?: { label: string; link: string }[];
  initiallyOpened?: boolean;
}

export function LinksGroup({ icon, label, links, initiallyOpened }: LinksGroupProps) {
  const [opened, setOpened] = useState(initiallyOpened || false);
  const IconComponent = lucideIcons[icon.charAt(0).toUpperCase() + icon.slice(1) as keyof typeof lucideIcons] as React.ElementType;

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpened((o) => !o)}
        className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
        style={{ marginLeft: '20px' }}
      >
        { <div className="flex items-center pl-3 text-sm cursor-pointer p-3">
            <span className="mr-2">{label}</span>
            <span className="flex items-center">
            <IconComponent size={17}/>
          </span>
        </div>}
        {links && (
          <span>
            {opened ? <lucideIcons.ChevronDown  /> : <lucideIcons.ChevronRight />}
          </span>
        )}
      </button>
      {opened && links && (
        <div className="pl-4">
          {links.map((link) => (
            <a href={link.link} key={link.label} className="block py-1">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}