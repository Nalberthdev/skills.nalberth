# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento
segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [1.1.0] - 2026-08-19

### Adicionado

- **Modo tradutor** na skill `mentor-dev`: todo conceito abstrato ganha uma comparação com o mundo
  real, obrigatoriamente com o limite declarado ("onde a analogia quebra"). Inclui um banco de
  comparações para cache, índice, middleware, async, transação e fila.
- **Método de leitura de código**: ensina que código se lê de dentro pra fora, não da esquerda pra
  direita, e traz as 5 perguntas de leitura que a pessoa responde antes de o mentor explicar.
  O antigo "Modo anatomia" continua, agora explicitamente como o modo em que o mentor lê *pela*
  pessoa — com a instrução de devolver a linha seguinte para ela ler sozinha.
- **`TOME NOTA DISSO`**: marcador em caixa alta para conhecimento de carreira, com barra de três
  testes (sobrevive à troca de stack, reaparece, corrige um erro real) e proibição explícita de
  virar carimbo de rodapé.
- **Área** (front, back ou fullstack) no Passo 0, com tabela de armadilhas típicas por área.
- Duas linhas novas no dial de nível: leitura de código e comparação.

### Alterado

- O propósito da skill passa a ser declarado de frente: fechar a distância entre o código que a IA
  gera e o que a pessoa consegue ler.

[Não lançado]: https://github.com/Nalberthdev/skills.nalberth/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Nalberthdev/skills.nalberth/compare/v1.0.0...v1.1.0

## [1.0.0] - 2026-08-19

Primeira versão pública.

### Adicionado

- CLI `nalberth-skills` com os comandos `list`, `targets`, `add`, `remove` e `validate`.
- Instalação em múltiplas ferramentas de IA via `--target`: `claude`, `cursor`, `windsurf`,
  `copilot`, `agents`, `gemini` e `print`.
- Instalação idempotente em arquivos compartilhados (`AGENTS.md`, `GEMINI.md`) usando marcadores
  HTML — reinstalar substitui o bloco em vez de duplicar.
- Rebaixamento automático de títulos ao embutir uma skill em arquivo compartilhado, preservando
  o conteúdo de blocos de código.
- Skill `mentor-dev`: mentoria calibrada pelo nível declarado (júnior, pleno ou sênior).
- `LICENSE` (MIT), `CONTRIBUTING.md`, `CHANGELOG.md`, `.gitignore` e CI no GitHub Actions.

### Alterado

- A skill `mentor-junior` virou `mentor-dev`, agora calibrada pelo nível que a pessoa declara em
  vez de assumir que quem usa é júnior.

[1.0.0]: https://github.com/Nalberthdev/skills.nalberth/releases/tag/v1.0.0
