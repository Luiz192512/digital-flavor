# Digital Flavor: Sistema Web para Gestão Sustentável de Cantinas Escolares

**Autores:** Luiz Gustavo Lorençone Enz, João Vitor Navari Elias Santos e Anthony Vinicius Gomes Oliveira.

## 1. Introdução

A gestão de cantinas escolares enfrenta desafios recorrentes: filas longas nos intervalos, desperdício de alimentos, baixa previsibilidade de demanda e controle de estoque pouco integrado. Esses problemas afetam a experiência dos estudantes e aumentam o custo operacional da cantina.

O Digital Flavor propõe uma aplicação web para conectar pedidos antecipados, controle de estoque, fila de preparo, pagamentos e relatórios em uma única plataforma. A proposta está alinhada ao Objetivo de Desenvolvimento Sustentável 12 da ONU, que incentiva consumo e produção responsáveis por meio de processos mais eficientes e menor desperdício.

## 2. Objetivo

Desenvolver uma aplicação web para cantinas escolares que permita:

- realização de pedidos antecipados pelos alunos;
- controle de estoque em tempo real;
- organização da fila de preparo por ordem de chegada;
- gestão de produtos com operações CRUD;
- acompanhamento de pagamentos por PIX, cartão ou dinheiro;
- visualização de relatórios de vendas, estoque e redução de desperdício.

## 3. Metodologia Atualizada

A solução foi planejada com arquitetura moderna para front-end web, banco de dados gerenciado e deploy em nuvem:

- **Front-end:** React, Vite, TypeScript, Tailwind CSS, React Router e lucide-react.
- **Backend e dados:** Supabase com PostgreSQL, autenticação, Row Level Security, perfis de usuário, produtos, estoque, pedidos, itens do pedido, pagamentos e movimentações de estoque.
- **Deploy:** Vercel, usando variáveis de ambiente para `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- **Testes:** Vitest, Testing Library e Playwright para validar regras de domínio, interface e fluxo principal em desktop e mobile.

O sistema contempla quatro perfis: cliente/aluno, funcionário, gerente e administrador. Cada perfil possui permissões coerentes com sua função: alunos realizam pedidos, funcionários acompanham a fila, gerentes controlam produtos e estoque, e administradores podem gerenciar usuários.

## 4. Modelagem Orientada a Objetos

A modelagem foi organizada em classes de domínio para deixar explícita a aplicação dos princípios de orientação a objetos:

- `Product`: representa produto, categoria, preço, tempo de preparo e pontuação de sustentabilidade.
- `InventoryItem`: controla quantidade, reserva, reposição e status de estoque.
- `Cart`: gerencia os itens selecionados pelo aluno e calcula totais.
- `Order`: representa o pedido, status, código de retirada e itens.
- `Payment`: controla método e status de pagamento.
- `UserProfile`: define permissões por perfil.
- Serviços como `StockService`, `CheckoutService`, `OrderQueueService` e `AdminActionHistory` separam regras de negócio da interface.

## 5. Estruturas de Dados

O projeto utiliza estruturas de dados de forma prática e demonstrável:

- **Lista:** catálogo de produtos, itens do carrinho, itens do pedido e histórico de vendas.
- **Fila FIFO:** fila de pedidos da cantina, garantindo que o primeiro pedido confirmado seja o primeiro a entrar em preparo.
- **Pilha:** histórico de ações administrativas, permitindo desfazer a última alteração em estoque, preço ou cadastro.

Essas estruturas tornam a aplicação mais alinhada às necessidades reais da cantina, especialmente no controle de fluxo durante horários de pico.

## 6. Interface Front-End e Estudo das Cores

A interface foi criada para unir experiência do aluno e operação da cantina. A tela inicial mostra proposta de valor, métricas operacionais, cardápio, carrinho, fila de pedidos, estoque, CRUD de produtos e relatórios.

A seleção de cores foi baseada em psicologia das cores e uso semântico:

- **Verde `#16A34A`:** sustentabilidade, frescor, ODS 12 e estoque disponível.
- **Azul `#2563EB`:** confiança, tecnologia, gestão e estados operacionais.
- **Laranja `#F97316`:** apetite, compra e chamadas de ação.
- **Vermelho `#DC2626`:** alerta, produto indisponível, cancelamento e estoque crítico.
- **Grafite, branco e cinza:** contraste, leitura profissional e base limpa.

A decisão de manter o laranja como cor de ação evita que o vermelho seja confundido com compra ou destaque positivo. O vermelho permanece reservado para risco, erro e urgência, o que torna a interface mais clara.

## 7. Resultados Esperados

Espera-se que o Digital Flavor contribua para:

- redução do tempo de espera nas filas;
- aumento da previsibilidade de demanda;
- menor desperdício de alimentos;
- melhor controle financeiro e operacional da cantina;
- expansão para outras instituições de ensino.

Do ponto de vista técnico, a aplicação busca tempo de resposta inferior a três segundos, interface responsiva e estrutura pronta para disponibilidade elevada em deploy na Vercel.

## 8. Considerações Finais

O Digital Flavor demonstra como tecnologia web pode resolver problemas reais no ambiente escolar. Ao combinar React, Supabase, Vercel, modelagem orientada a objetos e estruturas de dados, o projeto apresenta uma solução viável, criativa e alinhada ao consumo responsável.

## Referências

CORMEN, Thomas H. et al. *Algoritmos: teoria e prática*. 3. ed. Rio de Janeiro: Elsevier, 2012.

ORGANIZAÇÃO DAS NAÇÕES UNIDAS (ONU). *Transformando nosso mundo: a Agenda 2030 para o desenvolvimento sustentável*. Nova York: ONU, 2015. Disponível em: https://brasil.un.org/pt-br/sdgs.
