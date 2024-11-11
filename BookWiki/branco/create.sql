CREATE TABLE IF NOT EXISTS public.autor
(
    autor_key character varying(11) COLLATE pg_catalog."default" NOT NULL,
    nome character varying(255) COLLATE pg_catalog."default",
    foto_url character varying(255) COLLATE pg_catalog."default",
    qtd_trabalhos integer,
    usuario_id integer,
    CONSTRAINT autor_pkey PRIMARY KEY (autor_key)
);

CREATE TABLE IF NOT EXISTS public.categoria
(
    categoria_id serial NOT NULL,
    nome character varying(255) COLLATE pg_catalog."default",
    usuario_id integer,
    CONSTRAINT categoria_pkey PRIMARY KEY (categoria_id),
    CONSTRAINT categoria_nome_key UNIQUE (nome)
);

CREATE TABLE IF NOT EXISTS public.editora
(
    editora_id serial NOT NULL,
    nome character varying(255) COLLATE pg_catalog."default",
    usuario_id integer,
    CONSTRAINT editora_pkey PRIMARY KEY (editora_id),
    CONSTRAINT editora_nome_key UNIQUE (nome)
);

CREATE TABLE IF NOT EXISTS public.lingua
(
    lingua_id serial NOT NULL,
    sigla character varying(3) COLLATE pg_catalog."default",
    CONSTRAINT lingua_pkey PRIMARY KEY (lingua_id),
    CONSTRAINT lingua_sigla_key UNIQUE (sigla)
);

CREATE TABLE IF NOT EXISTS public.lista_livros
(
    lista_id serial NOT NULL,
    usuario_id integer NOT NULL,
    nome_lista character varying(255) COLLATE pg_catalog."default",
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lista_livros_pkey PRIMARY KEY (lista_id)
);

CREATE TABLE IF NOT EXISTS public.lista_livros_livro
(
    lista_id integer NOT NULL,
    livro_key character varying(11) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT lista_livros_livro_pkey PRIMARY KEY (lista_id, livro_key)
);

CREATE TABLE IF NOT EXISTS public.livro
(
    livro_key character varying(11) COLLATE pg_catalog."default" NOT NULL,
    titulo character varying(255) COLLATE pg_catalog."default",
    subtitulo character varying(255) COLLATE pg_catalog."default",
    ano_publicacao integer,
    qtd_paginas integer,
    qtd_avaliacoes integer,
    capa_url character varying(255) COLLATE pg_catalog."default",
    editora_id integer,
    lingua_sigla character varying(5) COLLATE pg_catalog."default",
    usuario_id integer,
    CONSTRAINT livro_pkey PRIMARY KEY (livro_key)
);

CREATE TABLE IF NOT EXISTS public.livro_autor
(
    livro_key character varying(11) COLLATE pg_catalog."default" NOT NULL,
    autor_key character varying(11) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT livro_autor_pkey PRIMARY KEY (livro_key, autor_key)
);

CREATE TABLE IF NOT EXISTS public.livro_categoria
(
    livro_key character varying(11) COLLATE pg_catalog."default" NOT NULL,
    categoria_id integer NOT NULL,
    CONSTRAINT livro_categoria_pkey PRIMARY KEY (livro_key, categoria_id)
);

CREATE TABLE IF NOT EXISTS public.perfil
(
    perfil_id serial NOT NULL,
    usuario_id integer NOT NULL,
    bio text COLLATE pg_catalog."default",
    foto_url character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT perfil_pkey PRIMARY KEY (perfil_id)
);

CREATE TABLE IF NOT EXISTS public.review
(
    review_id serial NOT NULL,
    usuario_id integer NOT NULL,
    livro_key character varying(11) COLLATE pg_catalog."default" NOT NULL,
    texto text COLLATE pg_catalog."default",
    nota integer,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_pkey PRIMARY KEY (review_id)
);

CREATE TABLE IF NOT EXISTS public.usuario
(
    usuario_id serial NOT NULL,
    nome character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    senha character varying(255) COLLATE pg_catalog."default" NOT NULL,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuario_pkey PRIMARY KEY (usuario_id),
    CONSTRAINT usuario_email_key UNIQUE (email)
);

ALTER TABLE IF EXISTS public.autor
    ADD CONSTRAINT autor_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuario (usuario_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.categoria
    ADD CONSTRAINT categoria_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuario (usuario_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.editora
    ADD CONSTRAINT editora_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuario (usuario_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.lista_livros
    ADD CONSTRAINT lista_livros_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuario (usuario_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.lista_livros_livro
    ADD CONSTRAINT lista_livros_livro_lista_id_fkey FOREIGN KEY (lista_id)
    REFERENCES public.lista_livros (lista_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.lista_livros_livro
    ADD CONSTRAINT lista_livros_livro_livro_key_fkey FOREIGN KEY (livro_key)
    REFERENCES public.livro (livro_key) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.livro
    ADD CONSTRAINT livro_editora_id_fkey FOREIGN KEY (editora_id)
    REFERENCES public.editora (editora_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS livro_editora_id
    ON public.livro(editora_id);


ALTER TABLE IF EXISTS public.livro
    ADD CONSTRAINT livro_lingua_sigla_fkey FOREIGN KEY (lingua_sigla)
    REFERENCES public.lingua (sigla) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.livro
    ADD CONSTRAINT livro_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuario (usuario_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.livro_autor
    ADD CONSTRAINT livro_autor_autor_key_fkey FOREIGN KEY (autor_key)
    REFERENCES public.autor (autor_key) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.livro_autor
    ADD CONSTRAINT livro_autor_livro_key_fkey FOREIGN KEY (livro_key)
    REFERENCES public.livro (livro_key) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.livro_categoria
    ADD CONSTRAINT livro_categoria_categoria_id_fkey FOREIGN KEY (categoria_id)
    REFERENCES public.categoria (categoria_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.livro_categoria
    ADD CONSTRAINT livro_categoria_livro_key_fkey FOREIGN KEY (livro_key)
    REFERENCES public.livro (livro_key) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.perfil
    ADD CONSTRAINT perfil_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuario (usuario_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.review
    ADD CONSTRAINT review_livro_key_fkey FOREIGN KEY (livro_key)
    REFERENCES public.livro (livro_key) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.review
    ADD CONSTRAINT review_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuario (usuario_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;