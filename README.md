# mentordev

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

> **A IA cospe código mais rápido do que você consegue entender.**
> Isso transforma a sua IA num mentor sênior que te obriga a entender.

`mentordev` é uma skill de mentoria que funciona em **qualquer ferramenta de IA** — Claude Code,
Cursor, Windsurf, GitHub Copilot, Gemini CLI, ChatGPT. Um comando instala.

Em vez de te entregar código pronto, ela:

- **te ensina a ler** cada linha, em vez de só explicar o que ela faz;
- **traduz todo conceito abstrato** numa comparação do mundo real — e diz onde a comparação quebra;
- **exige justificativa** de toda decisão técnica: se você não sabe explicar, você chutou;
- **marca com `TOME NOTA DISSO`** o que você leva pra carreira inteira, não só pra esta tarefa;
- **te para** quando você foge pra zona de conforto ou conserta o sintoma na camada errada.

Ela se calibra pelo nível e pela área que você declara — júnior, pleno ou sênior; front, back ou
fullstack. O nível gradua **quanto ela entrega antes de cobrar**, nunca o quanto ela cobra.

O repositório também traz o CLI que instala a skill em qualquer uma dessas ferramentas: você
escreve uma vez, ele converte para o formato que cada uma entende.

----------------------

## Instalação rápida

Não precisa clonar nem instalar nada — o `npx` baixa direto do GitHub e roda na hora:

```bash
# ver o que existe
npx github:Nalberthdev/mentordev list

# instalar no Claude Code (padrão, vale pra todos os seus projetos)
npx github:Nalberthdev/mentordev add mentor-dev

# instalar no Cursor, só neste projeto
npx github:Nalberthdev/mentordev add mentor-dev --target cursor
```

Requer [Node.js](https://nodejs.org) 18 ou superior e `git` instalado.

Se digitar muito, crie um atalho no seu shell:

```bash
alias mentordev='npx -y github:Nalberthdev/mentordev'
mentordev add mentor-dev --target cursor
```

> **Ainda não está no npm.** `npx mentordev` responde `404 Not Found` — use a forma
> `github:` acima. Quando o pacote for publicado, o nome curto passa a funcionar também.

Prefere clonar?

```bash
git clone https://github.com/Nalberthdev/mentordev.git
cd mentordev
node bin/cli.js add mentor-dev
```

---

## Ferramentas suportadas

| `--target`  | Ferramenta                                    | Onde escreve                                  | Escopo             |
| ----------- | --------------------------------------------- | --------------------------------------------- | ------------------ |
| `claude`    | Claude Code / Claude Desktop *(padrão)*        | `~/.claude/skills/<skill>/`                    | máquina ou projeto |
| `cursor`    | Cursor                                         | `.cursor/rules/<skill>.mdc`                    | projeto            |
| `windsurf`  | Windsurf                                       | `.windsurf/rules/<skill>.md`                   | projeto            |
| `copilot`   | GitHub Copilot (VS Code)                       | `.github/instructions/<skill>.instructions.md` | projeto            |
| `agents`    | Codex, Zed, Aider, Jules e outros              | `AGENTS.md`                                    | projeto            |
| `gemini`    | Gemini CLI                                     | `~/.gemini/GEMINI.md` ou `GEMINI.md`           | máquina ou projeto |
| `print`     | ChatGPT, Claude.ai, Gemini — qualquer chat     | imprime no terminal pra copiar e colar         | —                  |

Não achou a sua? Use `print` e cole no chat:

```bash
npx github:Nalberthdev/mentordev add mentor-dev -t print   # imprime na tela
npx github:Nalberthdev/mentordev add mentor-dev -t print | xclip -sel c
npx github:Nalberthdev/mentordev add mentor-dev -t print | pbcopy  # macOS
```

Instalar em alvos que compartilham um arquivo (`agents`, `gemini`) é **idempotente**: a skill entra
entre marcadores HTML e reinstalar substitui o bloco anterior em vez de duplicar.

---

## Comandos

Nos exemplos abaixo, `mentordev` é abreviação de
`npx github:Nalberthdev/mentordev` (ou do `alias` sugerido acima).

```bash
mentordev list                  # lista as skills disponíveis
mentordev targets               # lista os alvos de IA suportados
mentordev add <skill...>        # instala
mentordev remove <skill...>     # desinstala
mentordev validate              # checa o formato das skills do repositório
```

**Flags:**

| Flag                | Efeito                                                          |
| ------------------- | --------------------------------------------------------------- |
| `-t`, `--target`    | ferramenta de destino (padrão: `claude`)                         |
| `--local`           | instala no projeto atual em vez de na máquina inteira            |
| `--all`             | aplica a todas as skills disponíveis                             |

```bash
# todas as skills, para o Copilot, neste projeto
npx github:Nalberthdev/mentordev add --all --target copilot

# desinstalar
npx github:Nalberthdev/mentordev remove mentor-dev
```

---

## Skills disponíveis

### `mentor-dev`

**A IA cospe código mais rápido do que você consegue entender.** Essa skill existe pra fechar essa
distância: o objetivo não é você receber código bom, é você **conseguir ler** o código que aparecer
na sua frente — venha da IA, de um colega ou de um repositório qualquer.

Postura de mentor sênior calibrada pelo **nível e pela área que você declara**:

```
/mentor-dev junior front
/mentor-dev pleno back
/mentor-dev senior fullstack
```

Sem argumento, ela pergunta nível, área, seu gap atual e pra onde você foge quando trava — e só
começa depois disso. O nível gradua **quanto ela entrega antes de cobrar**, não o quanto ela cobra:
júnior recebe mais explicação, não menos exigência. A área decide de onde vêm os exemplos.

**O que ela faz:**

- **Ensina a ler código**, não só explica. Código não se lê da esquerda pra direita — se lê de
  dentro pra fora. Ela te dá as 5 perguntas de leitura e faz você responder antes de contar.
- **Traduz todo conceito abstrato numa comparação do mundo real** — e sempre diz *onde a
  comparação quebra*, porque analogia sem limite ensina errado.
- **`TOME NOTA DISSO`** marca o que você leva pra carreira inteira, não só pra esta tarefa. Só
  entra o que sobrevive à troca de stack.
- **Conduz por perguntas** em vez de dar a resposta pronta, exige justificativa de toda decisão,
  recusa resposta vaga ("otimizar", "fazer da melhor forma"), aponta quando você conserta o
  sintoma na camada errada e bloqueia sua fuga pra zona de conforto.

---

## Criar a sua própria skill

Este repositório é um esqueleto: dá pra fazer fork e trocar por skills suas.

1. Crie a pasta `skills/<nome-da-skill>/`. O nome precisa ser kebab-case minúsculo.
2. Dentro dela, crie `SKILL.md` começando com o frontmatter:

   ```markdown
   ---
   name: nome-da-skill
   description: Uma frase dizendo o que a skill faz e quando a IA deve acioná-la.
   ---

   # Título

   O conteúdo da skill em markdown.
   ```

3. Rode `node bin/cli.js validate` — ele confere que o `name` bate com o nome da pasta, que a
   `description` existe e que o corpo não está vazio.

A `description` é o que faz a IA decidir sozinha se aciona a skill. Escreva ela como gatilho
("Use sempre que…"), não como resumo.

Detalhes e convenções em [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Como funciona

A skill é escrita **uma vez** no formato do Claude Code (`SKILL.md` com frontmatter YAML). Na
instalação, o CLI separa frontmatter e corpo, e reescreve nos moldes de cada ferramenta:

```
skills/mentor-dev/SKILL.md
        │
        ├── claude    → copia a pasta inteira, sem conversão
        ├── cursor    → frontmatter .mdc (description + alwaysApply)
        ├── windsurf  → frontmatter de regra (trigger: model_decision)
        ├── copilot   → frontmatter de instruções (applyTo)
        ├── agents    → bloco marcado em AGENTS.md, títulos rebaixados
        └── print     → corpo puro, pra colar em qualquer chat
```

Só o alvo `claude` copia arquivos auxiliares (`references/`, scripts). Os outros leem apenas o
conteúdo do `SKILL.md` — o CLI avisa quando algo ficou de fora.

---

## Contribuindo

Issues e pull requests são bem-vindos. Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

[MIT](LICENSE) © Nalberthdev
