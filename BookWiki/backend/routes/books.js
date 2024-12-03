const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();
const prisma = new PrismaClient();

//rota para buscar todos os livros
router.get("/livros", async (req, res) => {
  try {
    const livros = await prisma.livro.findMany({
      select: {
        livro_key: true,
        titulo: true,
        subtitulo: true,
        ano_publicacao: true,
        qtd_paginas: true,
        qtd_avaliacoes: true,
        capa_url: true,
        editora: {
          select: {
            nome: true,
          },
        },
        lingua: {
          select: {
            sigla: true,
          },
        },
        livro_autor: {
          select: {
            autor: {
              select: {
                autor_key: true,
                nome: true,
                foto_url: true,
              },
            },
          },
        },
        review: {
          select: {
            review_id: true,
            data_criacao: true,
            livro_key: true,
            texto: true,
            nota: true,
            usuario: {
              select: {
                nome: true,
                usuario_id: true,
                perfil: {
                  select: {
                    foto_url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json(livros);
    console.log("Livros encontrados:", livros); // Log dos livros encontrados
  } catch (error) {
    console.error("Erro ao buscar livros:", error); // Log do erro
    res.status(500).json({ error: "Erro ao buscar livros." });
  }
});

// Rota para buscar um livro específico
router.get("/livros/:livro_key", async (req, res) => {
  const { livro_key } = req.params;
  console.log('buscando unico livro');
  console.log('livro_key', livro_key);
  console.log('req.params', req.params);
  try {
    const livro = await prisma.livro.findUnique({
      where: { livro_key },
      select: {
        livro_key: true,
        titulo: true,
        subtitulo: true,
        ano_publicacao: true,
        qtd_paginas: true,
        qtd_avaliacoes: true,
        capa_url: true,
        editora: {
          select: {
            nome: true,
          },
        },
        lingua: {
          select: {
            sigla: true,
          },
        },
        livro_autor: {
          select: {
            autor: {
              select: {
                autor_key: true,
                nome: true,
                foto_url: true,
              },
            },
          },
        },
        review: {
          select: {
            review_id: true,
            data_criacao: true,
            livro_key: true,
            texto: true,
            nota: true,
            usuario: {
              select: {
                nome: true,
                usuario_id: true,
                tipo: true,
                perfil: {
                  select: {
                    foto_url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!livro) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    res.json(livro);
    console.log("Livro encontrado:", livro); // Log do livro encontrado
  } catch (error) {
    console.error("Erro ao buscar livro:", error); // Log do erro
    res.status(500).json({ error: "Erro ao buscar livro." });
  }
});

// Rota para atualizar um livro
router.put("/livros/:livro_key", async (req, res) => {
  console.log('Atualizando livro');
  const { livro_key } = req.params;
  const { titulo, subtitulo, capa_url } = req.body;

  if (!titulo && !subtitulo && !capa_url) {
    return res.status(400).json({ error: "Título, subtítulo ou URL da capa são obrigatórios." });
  }

  try {
    // Verificar se o livro existe
    const livroExistente = await prisma.livro.findUnique({ where: { livro_key } });
    if (!livroExistente) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    // Atualizar o livro
    const updatedLivro = await prisma.livro.update({
      where: { livro_key },
      data: {
        titulo: titulo || livroExistente.titulo,
        subtitulo: subtitulo || livroExistente.subtitulo,
        capa_url: capa_url || livroExistente.capa_url,
      },
    });

    console.log('updatedLivro', updatedLivro);
    res.status(200).json(updatedLivro);
    console.log("Livro atualizado:", updatedLivro); // Log do livro atualizado
  } catch (error) {
    console.error("Erro ao atualizar livro:", error); // Log do erro
    res.status(500).json({ error: "Erro ao atualizar livro." });
  }
});

router.delete("/livros/:livro_key", async (req, res) => {
  const { livro_key } = req.params;

  try {
    // Verificar se o livro existe
    const livroExistente = await prisma.livro.findUnique({ where: { livro_key } });
    if (!livroExistente) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    // Excluir o livro
    await prisma.livro.delete({ where: { livro_key } });

    res.status(200).json({ message: "Livro excluído com sucesso." });
    console.log("Livro excluído:", livro_key); // Log do livro excluído
  } catch (error) {
    console.error("Erro ao excluir livro:", error); // Log do erro
    res.status(500).json({ error: "Erro ao excluir livro." });
  }
});

// Rota para buscar a lista de livros na API do OpenLibrary
router.get("/buscar-livros", async (req, res) => {
  console.log('Buscando livro');
  const { nomeLivro } = req.query;

  if (!nomeLivro) {
    return res.status(400).json({ error: "Nome do livro é obrigatório." });
  }

  try {
    const response = await axios.get(`https://openlibrary.org/search.json?title=${nomeLivro}`);
    const livros = response.data.docs.slice(0, 3).map((livro) => ({
      key: livro.key,
      author_name: livro.author_name,
      author_key: livro.author_key,
      title: livro.title,
      subtitle: livro.subtitle,
      first_publish_year: livro.first_publish_year,
      number_of_pages_median: livro.number_of_pages_median,
      cover_i: livro.cover_i,
      publisher: livro.publisher,
      language: livro.language,
    }));
    console.log(`Livros encontrados: ${livros.length}`);
    console.log('livros', livros);
    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros na API do OpenLibrary:", error);
    res.status(500).json({ error: "Erro ao buscar livros na API do OpenLibrary." });
  }
});
// Rota para adicionar um livro
router.post("/livros/registro", async (req, res) => {
  console.log('Registrando livro');
  console.log('req.body', req.body);
  let { livro_key, titulo, subtitulo, ano_publicacao, qtd_paginas, capa_url, editora_nome, lingua_sigla, usuario_id, author_key, author_name, autor_key } = req.body;

  // Filtrar o livro_key para pegar apenas o valor após a última barra
  livro_key = livro_key.split('/').pop();
  author_key = String(author_key).replace(/[\[\]]/g, '');
  author_name = String(author_name).replace(/[\[\]]/g, '');
  nome = author_name;
  console.log('author_name', author_name);
  console.log('name', nome);


  const livroExistente = await prisma.livro.findUnique({ where: { livro_key } });
  if (livroExistente) {
    return res.status(400).json({ error: "Livro já registrado." });
  }

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
    autor_key = author_key;

    // Verifique se o autor existe, caso contrário, adicione-o
    let autor;
    if (author_key) {
      autor = await prisma.autor.findUnique({ where: { autor_key } });
      if (autor) {
        // Atualizar a quantidade de trabalhos do autor existente
        
        autor = await prisma.autor.update({
          where: { autor_key },
          data: {
            qtd_trabalhos: autor.qtd_trabalhos + 1,
          },
        });
      } else {
        // Construir a URL da foto
        const foto_url = `https://covers.openlibrary.org/a/olid/${autor_key}-L.jpg`;

        autor = await prisma.autor.create({
          data: {
            autor_key,
            nome,
            foto_url,
            qtd_trabalhos: 1, // Inicialmente um trabalho
            usuario_id: null, // Defina como null se não fornecido
          },
        });
        console.log('autor', autor);
      }
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
        usuario_id: usuario_id || null, // Defina como null se não fornecido
      },
    });

    // Associe o autor ao livro, se o autor_key foi fornecido
    if (autor_key) {
      await prisma.livro_autor.create({
        data: {
          livro_key: livro.livro_key,
          autor_key: autor.autor_key,
        },
      });
    }

    res.status(201).json(livro);
    console.log("Livro criado:", livro); // Log do livro criado
  } catch (error) {
    console.error("Erro ao criar livro:", error); // Log do erro
    res.status(500).json({ error: "Erro ao criar livro." });
  }
});
// Rota para buscar a lista de autores na API do OpenLibrary
router.get("/buscar-autores", async (req, res) => {
  console.log('Buscando autor');
  const { nomeAutor } = req.query;

  if (!nomeAutor) {
    return res.status(400).json({ error: "Nome do autor é obrigatório." });
  }

  try {
    const response = await axios.get(`https://openlibrary.org/search/authors.json?q=${nomeAutor}`);
    const autores = response.data.docs.slice(0, 3).map((autor) => ({
      key: autor.key,
      name: autor.name,
      work_count: autor.work_count,
      birth_date: autor.irth_date,
      death_date: autor.death_date,
      top_work: autor.top_work,
      top_subjects: autor.top_subjects,
    }));
    console.log(`Autores encontrados: ${autores.length}`);
    console.log('autores', autores);
    res.json(autores);
  } catch (error) {
    console.error("Erro ao buscar autores na API do OpenLibrary:", error);
    res.status(500).json({ error: "Erro ao buscar autores na API do OpenLibrary." });
  }
});

// Rota para adicionar um autor
router.post("/autores/registro", async (req, res) => {
  console.log('Adicionando autor');
  console.log('req.body', req.body);
  const { author_key, author_name, author_work_count, author_death_date, author_top_work, author_top_subjects } = req.body;

  if (!author_key || !author_name) {
    return res.status(400).json({ error: "Chave e nome do autor são obrigatórios." });
  }

  try {
    // Verificar se o autor já existe no banco de dados
    const autorExistente = await prisma.autor.findUnique({ where: { autor_key: author_key } });
    if (autorExistente) {
      return res.status(400).json({ error: "Autor já registrado." });
    }

    // Construir a URL da foto
    const foto_url = `https://covers.openlibrary.org/a/olid/${author_key}-L.jpg`;

    // Adicionar o autor ao banco de dados
    const novoAutor = await prisma.autor.create({
      data: {
        autor_key: author_key,
        nome: author_name,
        foto_url,
        qtd_trabalhos: author_work_count,
        usuario_id: null, // Defina como null se não fornecido
      },
    });

    res.status(201).json(novoAutor);
    console.log("Autor criado:", novoAutor); // Log do autor criado
  } catch (error) {
    console.error("Erro ao adicionar autor:", error); // Log do erro
    res.status(500).json({ error: "Erro ao adicionar autor." });
  }
});

module.exports = router;