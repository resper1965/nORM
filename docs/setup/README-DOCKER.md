# Docker Setup - Gabi Clean Dashboard

Este projeto pode ser executado usando Docker e Docker Desktop.

## Pré-requisitos

- Docker Desktop instalado e rodando
- Porta 3000 disponível

## Desenvolvimento

Para rodar o projeto em modo desenvolvimento:

```bash
# Usar docker-compose (recomendado)
docker-compose up

# Ou construir e rodar manualmente
docker build -f Dockerfile.dev -t gabi-clean:dev .
docker run -p 3000:3000 -v $(pwd):/app gabi-clean:dev
```

O projeto estará disponível em: http://localhost:3000

### Com docker-compose (desenvolvimento)

```bash
# Iniciar o container
docker-compose up

# Rodar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar o container
docker-compose down

# Reconstruir após mudanças nas dependências
docker-compose up --build
```

## Produção

Para rodar em modo produção:

```bash
# Usar docker-compose para produção
docker-compose -f docker-compose.prod.yml up -d

# Ou construir e rodar manualmente
docker build -t gabi-clean:prod .
docker run -p 3000:3000 gabi-clean:prod
```

## Estrutura Docker

- `Dockerfile` - Configuração para produção (otimizada)
- `Dockerfile.dev` - Configuração para desenvolvimento (hot reload)
- `docker-compose.yml` - Compose para desenvolvimento
- `docker-compose.prod.yml` - Compose para produção
- `.dockerignore` - Arquivos ignorados no build

## Troubleshooting

### Porta já em uso
Se a porta 3000 estiver ocupada, altere no `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Altere 3001 para outra porta
```

### Reconstruir containers
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Limpar tudo
```bash
docker-compose down -v
docker system prune -a
```

## Comandos Úteis

```bash
# Entrar no container
docker exec -it gabi-clean-dashboard sh

# Ver logs em tempo real
docker-compose logs -f app

# Reiniciar o container
docker-compose restart
```

