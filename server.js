const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
require('dotenv').config();
// -----------------------------------------------------------------------------------------

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware de autenticação para rotas protegidas
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  // Exemplo de autenticação para requisições POST para /produtos
  if (req.path.startsWith('/produtos') && req.method === 'POST') {
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Token is missing or invalid' });
    }
  }
  next(); // Permite que a requisição prossiga para a próxima middleware/rota
});

// Swagger (documentação da API)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

let produtos = []; // Mantenha isso APENAS se você não for usar um banco de dados real.

// Servir arquivos estáticos (HTML/CSS/JS da pasta 'public')
app.use(express.static('public'));

// Rotas para as páginas HTML
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/calcular', (req, res) => res.sendFile(__dirname + '/public/calcular.html'));
app.get('/consultar', (req, res) => res.sendFile(__dirname + '/public/consultar.html'));
app.get('/remover', (req, res) => res.sendFile(__dirname + '/public/remover.html'));
app.get('/listaCompleta', (req, res) => res.sendFile(__dirname + '/public/listaCompleta.html'));

// Rota de termos de serviço (usado no Swagger)
app.get('/terms', (req, res) => {
  res.json({ message: 'Termos de Serviço' });
});

// Rotas da API (usando o array 'produtos' em memória)
app.post('/produtos', (req, res) => {
  const body = req.body;

  const nome = body.nome || body.name;
  const descricao = body.descricao || body.description;
  const preco = body.preco ?? body.price;
  const peso = body.peso ?? body.weight;
  const dataCadastro = body.dataCadastro ?? body.date;

  if (!nome || !descricao || preco === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

  const exists = produtos.some(p => (p.nome ?? p.name)?.toLowerCase() === nome.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Produto já existe.' });
  }

  const novoProduto = {
    id: String(Date.now()),
    nome,
    descricao,
    preco,
    peso,
    dataCadastro,
    netshoes: body.netshoes,
    magalu: body.magalu,
    shopee: body.shopee,
    b2w: body.b2w,
    viavarejo: body.viavarejo,
    mercadoLivre: body.mercadoLivre,
    aliexpress: body.aliexpress,
    amazon: body.amazon,
    enjoei: body.enjoei,
    olx: body.olx
  };

  produtos.push(novoProduto);
  return res.status(200).json(novoProduto);
});

app.post('/consultar', (req, res) => {
  const termo = req.body.nome?.toLowerCase() || req.body.id;

  const produto = produtos.find(p =>
    (p.nome?.toLowerCase() === termo || p.name?.toLowerCase() === termo) ||
    p.id === termo
  );

  if (produto) return res.json(produto);
  return res.status(404).json({ error: 'Produto não encontrado' });
});

app.post('/remover', (req, res) => {
  const termo = req.body.nome?.toLowerCase() || req.body.id;

  const index = produtos.findIndex(p =>
    (p.nome?.toLowerCase() === termo || p.name?.toLowerCase() === termo) ||
    p.id === termo
  );

  if (index !== -1) {
    produtos.splice(index, 1);
    return res.json({ mensagem: 'Produto removido com sucesso.' });
  }

  res.status(404).json({ error: 'Produto não encontrado' });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`); // Mensagem genérica para funcionar localmente e no Render
});

module.exports = app;