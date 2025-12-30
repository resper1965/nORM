import type { OnboardingStep } from '@/components/onboarding/onboarding-tour'

export const dashboardOnboardingSteps: OnboardingStep[] = [
  {
    title: 'Bem-vindo ao nORM! 👋',
    description:
      'Este é seu painel de gerenciamento de reputação online. Vamos fazer um tour rápido pelas principais funcionalidades.',
    position: 'center',
  },
  {
    title: 'Score de Reputação',
    description:
      'Aqui você visualiza seu score de reputação (0-100) calculado com base em: posição no Google (35%), sentimento de notícias (25%), sentimento de redes sociais (20%), tendência (15%) e volume de menções (5%).',
    target: '[data-tour="reputation-score"]',
    position: 'bottom',
  },
  {
    title: 'Alertas de Reputação',
    description:
      'Receba alertas em tempo real quando conteúdo negativo aparecer no Google ou em redes sociais. Você pode marcar como resolvido ou dispensar.',
    target: '[data-tour="alerts"]',
    position: 'bottom',
  },
  {
    title: 'Monitoramento SERP',
    description:
      'Acompanhe suas posições no Google para as palavras-chave configuradas. Detectamos quedas e conteúdo negativo automaticamente.',
    target: '[data-tour="serp-tracking"]',
    position: 'bottom',
  },
  {
    title: 'Geração de Conteúdo com IA',
    description:
      'Quando detectamos conteúdo negativo, você pode gerar 3-5 artigos otimizados para SEO com um clique. A IA cria conteúdo positivo para contrabalancear.',
    target: '[data-tour="generate-content"]',
    position: 'left',
  },
  {
    title: 'Configurar Cliente',
    description:
      'Pronto para começar? Adicione seu primeiro cliente e configure as palavras-chave que deseja monitorar.',
    position: 'center',
    action: {
      label: 'Adicionar Cliente',
      onClick: () => {
        window.location.href = '/pt/clients/new'
      },
    },
  },
]

export const clientOnboardingSteps: OnboardingStep[] = [
  {
    title: 'Criar Novo Cliente',
    description:
      'Preencha as informações básicas do cliente: nome, domínio do site e configurações de monitoramento.',
    target: '[data-tour="client-form"]',
    position: 'right',
  },
  {
    title: 'Adicionar Palavras-Chave',
    description:
      'Configure 5-10 palavras-chave relevantes para monitorar no Google. Exemplo: "nome da empresa", "CEO nome", "produto principal".',
    target: '[data-tour="keywords-section"]',
    position: 'bottom',
  },
  {
    title: 'Conectar Redes Sociais',
    description:
      'Conecte Instagram, LinkedIn e Facebook para monitorar menções e sentimento em tempo real.',
    target: '[data-tour="social-media"]',
    position: 'bottom',
  },
  {
    title: 'Configurar WordPress (Opcional)',
    description:
      'Se você tem um blog WordPress, conecte para publicar artigos gerados automaticamente como rascunhos.',
    target: '[data-tour="wordpress-settings"]',
    position: 'bottom',
  },
]
