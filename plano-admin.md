# Plano de Implementação — Admin Dinâmico de Produtos

## Objetivo
Criar um sistema onde você possa **adicionar, editar, excluir e reordenar produtos** com upload de imagem que redimensiona automaticamente, sem precisar editar HTML na mão.

---

## Arquitetura (Opção A — Sem Servidor)

```
📁 #SEMANALIGHT/
  ├── index.html          ← carrega products.json e renderiza
  ├── products.json       ← dados dos produtos (com imagens Base64)
  ├── admin.html          ← painel visual de gerenciamento
  └── plano-admin.md      ← este documento
```

---

## 1. products.json — Estrutura

Cada produto passa a ter **preço individual**:

```json
[
  {
    "id": 1,
    "name": "Arroz com Feijão e Iscas de Frango com Ervas Provence",
    "img": "data:image/webp;base64,...",
    "price": 19.90,
    "originalPrice": 25.90,
    "category": "Refeições Leves"
  }
]
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | number | Identificador único |
| `name` | string | Nome do produto |
| `img` | string | URL externa **ou** Base64 da imagem em WebP |
| `price` | number | Preço atual (ex: 19.90) |
| `originalPrice` | number | Preço original para riscado (ex: 25.90) |
| `category` | string | Ex: "Refeições Leves", "Max", "Massas" |

---

## 2. index.html — Modificações

### O que muda:
- **Remover** array `products` hardcoded e constante `PRICE`
- **Adicionar** `fetch('products.json')` no início do script
- Cada produto usa seu próprio `p.price` e `p.originalPrice`
- Tag "Economize" calculada dinamicamente: `R$ ${(p.originalPrice - p.price).toFixed(2)}`
- Carrinho calcula subtotais por preço individual
- Fallback: se o fetch falhar, mantém produtos padrão embutidos

### Estrutura do script após mudança:

```js
let products = [];

fetch('products.json')
  .then(r => r.json())
  .then(data => { products = data; renderProducts(); })
  .catch(() => { products = FALLBACK_PRODUCTS; renderProducts(); });
```

---

## 3. admin.html — Painel de Gerenciamento

### Tela principal:
- **Tabela de produtos** com colunas: foto (thumbnail), nome, categoria, preço, ações
- Botão **"Adicionar Produto"** no topo
- Botão **"Importar JSON"** (carregar `products.json` existente)
- Botão **"Exportar / Salvar"** (baixar `products.json` atualizado)

### Formulário de produto (modal ou inline):
- **Nome** — input text
- **Categoria** — input text ou select (sugere: Refeições Leves, Max, Massas, Especiais)
- **Preço "De:"** — valor original (riscado)
- **Preço "Por:"** — valor atual
- **Imagem:**
  - Upload de arquivo (JPG/PNG)
  - Redimensionamento automático para **480×480 WebP 85%**
  - Preview na tela
  - Opção de colar URL externa também
- Botões **Salvar** / **Cancelar**

### Pipeline de redimensionamento (client-side):

```
Usuário seleciona imagem (JPG/PNG)
  ↓
FileReader → Image element
  ↓
Canvas 480×480 (object-fit: cover)
  ↓
canvas.toBlob('image/webp', 0.85)
  ↓
FileReader → Base64 data URL
  ↓
Preview + armazena no produto
```

### Ações por produto na lista:
- **✏️ Editar** — abre formulário preenchido
- **🗑️ Excluir** — confirma e remove
- **▲ ▼** — reordenar na lista

### Exportar:
- Gera JSON com array atualizado
- Faz download como `products.json`
- Imagens já inclusas como Base64

---

## 4. Fluxo de trabalho do usuário

### Adicionar produto novo:
```
admin.html →
  clica "Adicionar" →
  preenche nome, preços, categoria →
  faz upload da foto (auto redimensiona) →
  vê preview →
  clica "Salvar" →
  clica "Exportar" →
  baixa products.json →
  sobe o arquivo pro servidor
```

### Atualizar produto existente:
```
admin.html →
  clica "Importar JSON" →
  seleciona o products.json atual →
  edita o que precisar →
  clica "Exportar" →
  baixa products.json →
  sobe pro servidor
```

---

## 5. Benefícios

| Hoje | Com o sistema |
|---|---|
| Editar HTML na mão | Editor visual |
| Preço fixo R$ 19,90 para tudo | Cada produto com seu preço |
| Hospedar imagem externa + copiar URL | Upload com resize automático |
| Arrisca quebrar código ao editar | Dados separados do código |
| Produtos espalhados no HTML | Tudo centralizado no JSON |

---

## 6. Próximos passos

1. Criar `products.json` com os 12 produtos atuais (preços individuais)
2. Modificar `index.html` para carregar do JSON
3. Criar `admin.html` com upload + resize + CRUD
4. Testar fluxo completo: admin → export → index carrega
