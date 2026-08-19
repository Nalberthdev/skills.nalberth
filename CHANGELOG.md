# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento
segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

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

[Não lançado]: https://github.com/Nalberthdev/skills.nalberth/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Nalberthdev/skills.nalberth/releases/tag/v1.0.0
