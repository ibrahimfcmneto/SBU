const express = require('express'); 
const mysql = require('mysql2');     

const app = express();               
const port = 3000;                  


app.use(express.urlencoded({ extended: true }));

// Configuração das pastas (Rotas estáticas)
app.use('/aluno', express.static('Aluno'));
app.use('/biblio', express.static('Bibliotecario'));
app.use('/totem', express.static('Totem'));
app.use('/public', express.static('public'));            

// Conexão com Banco
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Thi1704@',      
    database: 'biblioteca_puc'
});

// Rota da Banca
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/banca.html');
});

// --- ROTA DE CADASTRAR ALUNO ---
app.post('/cadastrar', (req, res) => {
    console.log('Recebi dados do formulário:');
    const nome = req.body.nome;
    const ra = req.body.ra;
    console.log('Nome:', nome, 'RA:', ra);
    
    const sql = "INSERT INTO alunos (nome, ra) VALUES (?, ?)";

    db.query(sql, [nome, ra], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar no banco:', err);
            res.send('Ocorreu um erro ao tentar cadastrar. Tente novamente.');
            return;
        }
        console.log('Aluno cadastrado com sucesso!');
        res.send('<h1>Cadastro realizado com sucesso!</h1> <a href="/">Voltar</a>');
    });
});

// --- ROTA DE CADASTRAR LIVRO ---
app.post('/cadastrar-livro', (req, res) => {
    console.log('Recebi dados do formulário [LIVRO]:');

    const titulo = req.body.titulo;
    const codigo_livro = req.body.codigo_livro;
    const genero = req.body.genero;
    const autor = req.body.autor;
    const editora = req.body.editora;
    const quantidade_total = req.body.quantidade_total;
    const quantidade_disponivel = quantidade_total; 

    const sql = `
        INSERT INTO Livros 
        (codigo_livro, titulo, autor, genero, editora, quantidade_total, quantidade_disponivel) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [codigo_livro, titulo, autor, genero, editora, quantidade_total, quantidade_disponivel], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar livro:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('<h1>Erro: Este Código de Livro já está cadastrado.</h1> <a href="/biblio/cadastro.html">Voltar</a>');
            }
            res.status(500).send('Ocorreu um erro. <a href="/biblio/cadastro.html">Voltar</a>');
            return;
        }
        console.log('Livro cadastrado com sucesso!');
        res.send('<h1>Livro cadastrado com sucesso!</h1> <a href="/biblio/cadastro.html">Voltar</a>');
    });
});


app.post('/aluno-verificar', (req, res) => {
    const codigo = req.body.livro;

    const sql = "SELECT titulo, quantidade_disponivel FROM Livros WHERE codigo_livro = ?";

    db.query(sql, [codigo], (err, results) => {
        if (err) return res.send('Erro no banco.');

        
        if (results.length === 0) {
            return res.send(`
                <div style="text-align:center; padding:50px; font-family: sans-serif;">
                    <h1>Livro não encontrado </h1>
                    <p>O código <strong>${codigo}</strong> não existe.</p>
                    <a href="/aluno/consulta.html">Voltar</a>
                </div>
            `);
        }

        const livro = results[0];

        if (livro.quantidade_disponivel > 0) {
            res.send(`
                <div style="text-align:center; padding:50px; font-family: sans-serif; background-color: #d4edda; color: #155724;">
                    <h1>DISPONÍVEL! ✅</h1>
                    <h2>${livro.titulo}</h2>
                    <p>Temos ${livro.quantidade_disponivel} unidades.</p>
                    <a href="/aluno/consulta.html">Voltar</a>
                </div>
            `);
        } else {
            res.send(`
                <div style="text-align:center; padding:50px; font-family: sans-serif; background-color: #f8d7da; color: #721c24;">
                    <h1>INDISPONÍVEL ❌</h1>
                    <h2>${livro.titulo}</h2>
                    <p>Todos foram emprestados.</p>
                    <a href="/aluno/consulta.html">Voltar</a>
                </div>
            `);
        }
    });
});


// ROTA BIBLIOTECÁRIO
app.get('/biblio-listar-pendencias', (req, res) => {
    
    const sql = `
        SELECT 
            A.nome AS nome_aluno,
            A.ra AS ra_aluno,
            L.titulo AS nome_livro,
            L.codigo_livro,
            DATE_FORMAT(E.data_emprestimo, '%d/%m/%Y às %H:%i') AS data_saida
        FROM Emprestimos AS E
        JOIN alunos AS A ON E.id_aluno = A.id
        JOIN Livros AS L ON E.codigo_livro = L.codigo_livro
        WHERE E.data_devolucao IS NULL
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: 'Erro ao buscar dados' });
        }
       
        res.json(results);
    });
});

// INICIANDO O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Acesse http://localhost:3000 no seu navegador.');
});