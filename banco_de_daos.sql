CREATE DATABASE IF NOT EXISTS biblioteca_puc;

USE biblioteca_puc;

CREATE TABLE IF NOT EXISTS Alunos (
    ra VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    pontos INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Livros (
    codigo_livro VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255),
    genero VARCHAR(100),
    editora VARCHAR(100),
    quantidade_total INT NOT NULL DEFAULT 0,
    quantidade_disponivel INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Emprestimos (
    id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
    ra_aluno VARCHAR(20),
    codigo_livro VARCHAR(50),
    data_emprestimo DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real DATE DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'Ativo',

    FOREIGN KEY (ra_aluno) REFERENCES Alunos(ra),
    FOREIGN KEY (codigo_livro) REFERENCES Livros(codigo_livro)
);

USE biblioteca_puc;
SELECT * FROM Alunos;
SELECT * FROM Livros;