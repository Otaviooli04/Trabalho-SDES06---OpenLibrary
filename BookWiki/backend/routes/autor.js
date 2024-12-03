const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();
const prisma = new PrismaClient();

// Rota para buscar todos os autores
router.get("/autores", async (req, res) => {
  try {
    const autores = await prisma.autor.findMany({
      select: {
        autor_key: true,
        nome: true,
        foto_url: true,
        qtd_trabalhos: true,
        livro_autor: {
          select: {
            livro: {
              select: {
                livro_key: true,
                titulo: true,
              },
            },
          },
        },
      },
    });

    res.json(autores);
    console.log("Autores encontrados:", autores); // Log dos autores encontrados
  } catch (error) {
    console.error("Erro ao buscar autores:", error); // Log do erro
    res.status(500).json({ error: "Erro ao buscar autores." });
  }
});

// Rota para buscar um autor específico
router.get("/autores/:autor_key", async (req, res) => {
    const { autor_key } = req.params;
  
    try {
      const autor = await prisma.autor.findUnique({
        where: { autor_key },
        select: {
          autor_key: true,
          nome: true,
          foto_url: true,
          qtd_trabalhos: true,
          livro_autor: {
            select: {
              livro: {
                select: {
                  livro_key: true,
                  titulo: true,
                  livro_categoria: {
                    select: {
                      categoria: {
                        select: {
                          nome: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      if (!autor) {
        return res.status(404).json({ error: "Autor não encontrado." });
      }
  
      res.json(autor);
      console.log("Autor encontrado:", autor); // Log do autor encontrado
    } catch (error) {
      console.error("Erro ao buscar autor:", error); // Log do erro
      res.status(500).json({ error: "Erro ao buscar autor." });
    }
  });

// Rota para editar o nome e a foto URL de um autor
router.put("/autores/:autor_key", async (req, res) => {
    const { autor_key } = req.params;
    const { nome, foto_url } = req.body;
  
    if (!nome && !foto_url) {
      return res.status(400).json({ error: "Nome ou foto URL são obrigatórios." });
    }
  
    try {
      // Verificar se o autor existe
      const autorExistente = await prisma.autor.findUnique({ where: { autor_key } });
      if (!autorExistente) {
        return res.status(404).json({ error: "Autor não encontrado." });
      }
  
      // Atualizar o nome e a foto URL do autor
      const updatedAutor = await prisma.autor.update({
        where: { autor_key },
        data: {
          nome: nome || autorExistente.nome,
          foto_url: foto_url || autorExistente.foto_url,
        },
      });
  
      res.status(200).json(updatedAutor);
      console.log("Autor atualizado:", updatedAutor); // Log do autor atualizado
    } catch (error) {
      console.error("Erro ao atualizar autor:", error); // Log do erro
      res.status(500).json({ error: "Erro ao atualizar autor." });
    }
  });

// Rota para excluir um autor
router.delete("/autores/:autor_key", async (req, res) => {
    const { autor_key } = req.params;
  
    try {
      // Verificar se o autor existe
      const autorExistente = await prisma.autor.findUnique({ where: { autor_key } });
      if (!autorExistente) {
        return res.status(404).json({ error: "Autor não encontrado." });
      }
  
      // Excluir o autor e todos os registros relacionados
      await prisma.autor.delete({ where: { autor_key } });
  
      res.status(200).json({ message: "Autor excluído com sucesso." });
      console.log("Autor excluído:", autor_key); // Log do autor excluído
    } catch (error) {
      console.error("Erro ao excluir autor:", error); // Log do erro
      res.status(500).json({ error: "Erro ao excluir autor." });
    }
  });

module.exports = router;