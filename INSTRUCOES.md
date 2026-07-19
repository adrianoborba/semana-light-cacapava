# Como usar o sistema

## Primeira vez

1. Dê dois cliques em **iniciar.bat**
2. O navegador vai abrir com:
   - **Cardápio** (para clientes): http://localhost:8765/index.html
   - **Admin** (para você): http://localhost:8765/admin.html

## Seu fluxo de trabalho

### Para adicionar / editar / excluir produtos:

1. Abra o **admin** → http://localhost:8765/admin.html
2. Faça as alterações:
   - **Adicionar**: clique em "+ Adicionar" → preencha nome, preços, foto → "Salvar"
   - **Editar**: clique em "✏️ Editar" no produto → altere → "Salvar"
   - **Excluir**: clique em "🗑️" no produto → confirme
   - **Reordenar**: use ▲ ▼
3. Clique em **"Salvar no Servidor"** → salva direto no arquivo `products.json`
4. Pronto! O cardápio já mostra as alterações
5. (O **"Exportar JSON"** ainda existe como backup, se quiser baixar o arquivo)

### Foto do produto:
- Você pode fazer **upload** (o sistema redimensiona automaticamente pra 480×480)
- Ou colar uma **URL** de imagem externa

### Como funciona:
- `admin.html` → você edita os produtos
- `products.json` → arquivo com os dados (é o que você exporta/substitui)
- `index.html` → página do cardápio (lê o products.json)

## Importante
- O **iniciar.bat** precisa estar rodando enquanto você usa o sistema
- Para fechar, é só fechar a janela preta do terminal
