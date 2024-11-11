const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/livros", async (req, res) => {
  try {
    const livros = await prisma.livro.findMany({
      select: {
        livro_key: true,
        titulo: true,
      },
    });

    res.json(livros);
    console.log("Livros encontrados:", livros); // Log dos livros encontrados
  } catch (error) {
    console.error("Erro ao buscar livros:", error); // Log do erro
    console.log("Erro ao buscar livros.");
    res.status(500).json({ error: "Erro ao buscar livros." });
  }
});


// Rota para buscar a lista de livros na API do OpenLibrary
router.get("/buscar-livros", async (req, res) => {
  console.log('Buscando livro')
  const { nomeLivro } = req.query;

  if (!nomeLivro) {
    return res.status(400).json({ error: "Nome do livro é obrigatório." });
  }

  try {
    const response = await axios.get(`https://openlibrary.org/search.json?title=${nomeLivro}`);
    const livros = response.data.docs.slice(0, 1).map((livro) => ({
      key: livro.key,
      title: livro.title,
      subtitle: livro.subtitle,
      first_publish_year: livro.first_publish_year,
      number_of_pages_median: livro.number_of_pages_median,
      cover_i: livro.cover_i,
      publisher: livro.publisher,
      language: livro.language,
    }));
    console.log(`Livros encontrados: ${livros.length}`)
    console.log('livros', livros)
    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros na API do OpenLibrary:", error);
    res.status(500).json({ error: "Erro ao buscar livros na API do OpenLibrary." });
  }
});

// Rota para registrar o livro selecionado no banco de dados
router.post("/registra-livros",  async (req, res) => {
  const { livro_key, titulo, subtitulo, ano_publicacao, qtd_paginas, capa_url, editora_nome, lingua_sigla } = req.body;

  try {
    // Verifique se a editora existe, caso contrário, adicione-a
    let editora = await prisma.editora.findUnique({ where: { nome: editora_nome } });
    if (!editora) {
      editora = await prisma.editora.create({
        data: {
          nome: editora_nome,
          // Adicione outros campos necessários para a editora
        },
      });
    }

    // Verifique se a língua existe, caso contrário, adicione-a
    let lingua = await prisma.lingua.findUnique({ where: { sigla: lingua_sigla } });
    if (!lingua) {
      lingua = await prisma.lingua.create({
        data: {
          sigla: lingua_sigla,
          // Adicione outros campos necessários para a língua
        },
      });
    }

    // Crie o livro
    const livro = await prisma.livro.create({
      data: {
        livro_key,
        titulo,
        subtitulo,
        ano_publicacao,
        qtd_paginas,
        qtd_avaliacoes: 0, // Inicialmente zero avaliações
        capa_url,
        editora_id: editora.editora_id,
        lingua_sigla: lingua.sigla,
        usuario_id: req.user.id,
      },
    });

    res.status(201).json(livro);
    console.log("Livro criado:", livro); // Log do livro criado
  } catch (error) {
    console.error("Erro ao criar livro:", error); // Log do erro
    res.status(500).json({ error: "Erro ao criar livro." });
  }
});

module.exports = router;