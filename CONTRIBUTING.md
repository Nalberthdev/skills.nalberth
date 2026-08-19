# Contribuindo

Obrigado pelo interesse. Este repositório guarda skills de IA em português e um CLI que as
instala em várias ferramentas.

## Rodando localmente

```bash
git clone https://github.com/Nalberthdev/skills.nalberth.git
cd skills.nalberth

node bin/cli.js list
node bin/cli.js validate
```

Não há dependências — o CLI usa só a biblioteca padrão do Node 18+.

Para testar o comando como ele será usado de verdade:

```bash
npm link
nalberth-skills targets
npm unlink -g nalberth-skills   # quando terminar
```

Ao testar instalação, prefira um diretório descartável — os alvos escrevem em `~/.claude`,
`~/.gemini` e na pasta atual:

```bash
mkdir /tmp/teste && cd /tmp/teste
HOME=/tmp/teste node /caminho/do/repo/bin/cli.js add mentor-dev
```

## Adicionando uma skill

1. Crie `skills/<nome-da-skill>/SKILL.md`.
2. O nome da pasta deve ser **kebab-case minúsculo** e bater com o campo `name` do frontmatter.
3. O frontmatter é obrigatório e precisa de `name` e `description`:

   ```markdown
   ---
   name: minha-skill
   description: O que a skill faz e quando a IA deve acioná-la.
   ---

   # Título da skill

   Conteúdo.
   ```

4. Rode `node bin/cli.js validate` antes de abrir o PR.

### Convenções de conteúdo

- **A `description` é um gatilho, não um resumo.** Ela é o único texto que a IA lê pra decidir se
  aciona a skill. Escreva "Use sempre que…", não "Esta skill contém…".
- **Escreva instruções, não documentação.** A skill fala com o modelo, na segunda pessoa.
- **Prefira regra concreta a princípio abstrato.** "Não aceite 'otimizar' como resposta" funciona;
  "seja rigoroso" não.
- **Evite depender de arquivos auxiliares.** Só o alvo `claude` copia a pasta inteira; os outros
  leem apenas o `SKILL.md`. Se a skill precisar de `references/`, diga isso no PR.
- **Títulos começam em `#` (h1).** Ao embutir em `AGENTS.md`, o CLI rebaixa um nível
  automaticamente.

## Adicionando um alvo de IA

Alvos ficam no objeto `TARGETS` em `bin/cli.js`. Cada um precisa de:

| Campo     | O que é                                                             |
| --------- | ------------------------------------------------------------------- |
| `label`   | nome legível, mostrado em `nalberth-skills targets`                  |
| `scopes`  | `["global", "local"]`, ou só um dos dois                             |
| `pathFor` | `(skill, isLocal) => caminho de destino`                             |
| `install` | `(skill, isLocal) => { action, dest }`                               |
| `remove`  | `(skill, isLocal) => caminho removido, ou null se não havia nada`    |

Se o alvo escreve num arquivo compartilhado (como `AGENTS.md`), use `upsertBlock` e `removeBlock`
para manter a instalação idempotente. Depois: atualize a tabela do README e o CHANGELOG.

## Pull requests

- Um assunto por PR.
- Descreva o **porquê** da mudança, não só o quê.
- Se mexeu no CLI, diga como testou.

## Licença

Ao contribuir, você concorda que sua contribuição será licenciada sob a [MIT](LICENSE).
