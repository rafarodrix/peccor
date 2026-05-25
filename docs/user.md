# Peccor — Manual do Usuário

## Índice

1. [O que é o Peccor?](#o-que-é-o-peccor)
2. [Primeiros Passos](#primeiros-passos)
3. [Painel Principal (Dashboard)](#painel-principal-dashboard)
4. [Fazendas e Áreas](#fazendas-e-áreas)
5. [Lotes](#lotes)
6. [Rebanho (Animais)](#rebanho-animais)
7. [Pesagens](#pesagens)
8. [Compras](#compras)
9. [Vendas](#vendas)
10. [Custos](#custos)
11. [Manejo Sanitário](#manejo-sanitário)
12. [Financeiro](#financeiro)
13. [Relatórios e Exportação](#relatórios-e-exportação)
14. [Importação de Dados (CSV)](#importação-de-dados-csv)
15. [Alertas](#alertas)
16. [Projeções Financeiras](#projeções-financeiras)
17. [Configurações e Usuários](#configurações-e-usuários)
18. [Perfis de Acesso](#perfis-de-acesso)
19. [Perguntas Frequentes](#perguntas-frequentes)

---

## O que é o Peccor?

O Peccor é um sistema de gestão de pecuária bovina na nuvem. Ele permite controlar todo o ciclo do rebanho — desde a compra dos animais, passando por pesagens, saúde e custos, até a venda — com indicadores zootécnicos e financeiros em tempo real.

**Principais recursos:**
- Gestão de fazendas, piquetes e lotes
- Rastreabilidade individual de animais
- Histórico completo de pesagens com cálculo automático de GMD
- Controle financeiro: compras, vendas, custos e inadimplência
- Relatórios em PDF e planilhas CSV
- Alertas automáticos (animais sem pesagem, custos vencidos, etc.)
- Projeções de abate por lote
- Múltiplos usuários com perfis de acesso configuráveis

---

## Primeiros Passos

### Cadastro

1. Acesse o sistema e clique em **"Criar conta"**
2. Informe seu nome, e-mail e senha
3. Após o cadastro, você será direcionado para o painel

### Configuração inicial (Onboarding)

Ao entrar pela primeira vez, o painel mostrará um banner de configuração inicial com 3 etapas:

**Etapa 1 — Cadastre uma Fazenda**
- Vá em **Fazendas** no menu lateral
- Clique em **Nova Fazenda**
- Informe o nome, endereço e tipo de exploração

**Etapa 2 — Crie um Lote**
- Vá em **Lotes** e clique em **Novo Lote**
- Defina o nome, fazenda, peso-alvo e categoria

**Etapa 3 — Registre uma Pesagem**
- Vá em **Pesagens** e clique em **Nova Pesagem**
- Selecione o lote, data e peso médio

Após concluir as 3 etapas, o banner desaparece e o painel exibe dados reais.

---

## Painel Principal (Dashboard)

O painel mostra um resumo em tempo real da operação:

| Indicador | Descrição |
|---|---|
| **Animais Ativos** | Total de animais em lotes abertos |
| **Lotes Ativos** | Número de lotes em andamento |
| **Receita do Mês** | Total de vendas no mês atual |
| **Custos Pendentes** | Custos em aberto (não pagos) |

Abaixo dos cards aparecem os **últimos lotes registrados** com status e quantidade.

O **sino de alertas** (canto superior direito) mostra avisos automáticos importantes, como pesagens atrasadas e custos vencidos.

---

## Fazendas e Áreas

### Fazendas

As fazendas são o nível mais alto da hierarquia. Cada operação pode ter múltiplas fazendas.

**Para cadastrar uma fazenda:**
1. Clique em **Fazendas** no menu lateral
2. Clique em **Nova Fazenda**
3. Preencha: nome, estado, município, área (hectares) e tipo

**Página de detalhes da fazenda** (`/fazendas/[id]`):
- Resumo: quantidade de lotes, animais, áreas e custos
- Lista de lotes vinculados
- Lista de áreas (piquetes/pastos)

### Áreas

As áreas representam piquetes, pastos ou baias dentro de uma fazenda.

**Para cadastrar uma área:**
1. Abra a fazenda desejada
2. Clique em **Nova Área**
3. Informe o nome, tipo (Pasto, Piquete, Baia, Confinamento) e área em hectares

---

## Lotes

Lotes agrupam animais que são manejados juntos. Um animal pertence a um lote por vez.

### Criando um Lote

1. Clique em **Lotes** → **Novo Lote**
2. Preencha:
   - **Nome**: identificação do lote (ex: "Nelore Engorda 01")
   - **Fazenda**: a fazenda onde o lote está localizado
   - **Área**: piquete/pasto do lote (opcional)
   - **Categoria**: tipo de animal (ex: Nelore Macho, Cruzado Fêmea)
   - **Peso-alvo de abate** (kg): peso que define o momento ideal de venda
   - **Data de entrada**

### Status do Lote

| Status | Significado |
|---|---|
| **Ativo** | Lote em andamento, animais em campo |
| **Fechado** | Lote encerrado sem venda |
| **Vendido** | Lote liquidado (animals comercializados) |

### Página de Detalhes do Lote

A página de detalhes mostra:
- **Indicadores**: peso médio atual, GMD médio, total de pesagens
- **Projeção Financeira**: estimativa de lucro/prejuízo com sliders ajustáveis
- **Resumo Financeiro**: custo total acumulado
- **Gráfico de Evolução de Peso**: curva de peso ao longo do tempo
- **Gráfico de GMD**: ganho médio diário por período, com cores por desempenho
- **Lista de Pesagens**: histórico completo
- **Lista de Animais**: todos os animais do lote

---

## Rebanho (Animais)

### Cadastrando um Animal

1. Clique em **Rebanho** → **Novo Animal**
2. Preencha:
   - **Identificação (TAG/Brinco)**: código único do animal
   - **Raça**
   - **Sexo**: Macho / Fêmea
   - **Data de nascimento** (opcional)
   - **Peso de entrada** (kg)
   - **Lote** (opcional — pode ser associado depois)

### Página de Detalhes do Animal

- **Informações gerais**: raça, sexo, idade estimada
- **Histórico de pesagens**: todos os registros com peso e GMD
- **Gráfico de evolução de peso**
- **Gráfico de GMD por período**
- **Histórico de saúde**: vacinas, vermífugos, medicamentos aplicados

### Movimentação entre Lotes

Para mover um animal de um lote para outro, edite o animal e altere o campo **Lote**. O sistema registra automaticamente a movimentação.

---

## Pesagens

As pesagens são o principal indicador de desempenho do rebanho.

### Registrando uma Pesagem

1. Clique em **Pesagens** → **Nova Pesagem**
2. Preencha:
   - **Fazenda** e **Lote**
   - **Data da pesagem**
   - **Peso médio** (para pesagem de lote) ou **peso individual** (para animal)
   - **Responsável** (opcional)

### Cálculo Automático de GMD

Ao registrar uma pesagem, o sistema calcula automaticamente:
- **Ganho de Peso**: diferença em relação à pesagem anterior
- **Dias entre pesagens**
- **GMD** (Ganho Médio Diário) = ganho de peso ÷ dias

### Interpretando o GMD

| Faixa de GMD | Cor no Gráfico | Avaliação |
|---|---|---|
| ≥ 1,2 kg/dia | Verde | Excelente |
| 0,8 a 1,19 kg/dia | Amarelo | Aceitável |
| < 0,8 kg/dia | Vermelho | Atenção necessária |

---

## Compras

Registre aquisições de animais com todos os custos associados.

### Registrando uma Compra

1. Clique em **Compras** → **Nova Compra**
2. Preencha:
   - **Fornecedor**
   - **Data da compra**
   - **Quantidade de animais**
   - **Valor dos animais** (R$)
   - **Frete** (R$)
   - **Comissão** (R$)
   - **Outros custos** (R$)
   - **Forma de pagamento** e **Vencimento**

O sistema calcula automaticamente o **Valor Total** = animais + frete + comissão + outros.

---

## Vendas

Registre vendas de animais com todas as deduções.

### Registrando uma Venda

1. Clique em **Vendas** → **Nova Venda**
2. Preencha:
   - **Comprador**
   - **Data da venda**
   - **Quantidade** e **Peso total** (kg)
   - **Preço por arroba** (R$/@)
   - **Valor dos animais** (R$)
   - **Frete**, **Comissão** e **Desconto** (R$)

O sistema calcula:
- **Arrobas vendidas** = peso total ÷ 15
- **Valor Líquido** = valor dos animais − frete − comissão − desconto

> **O que é arroba?** No mercado pecuário brasileiro, 1 arroba = 15 kg.

---

## Custos

Controle todas as despesas da operação: funcionários, ração, vacinas, arrendamento, manutenção e mais.

### Categorias de Custo

| Categoria | Exemplos |
|---|---|
| Funcionário | Salários, encargos |
| Ração | Ração concentrada, silagem |
| Sal Mineral | Suplementação mineral |
| Vacina | Vacinações |
| Medicamento | Tratamentos |
| Energia | Conta de luz, bombeamento |
| Arrendamento | Aluguel de pasto |
| Frete | Transporte de animais |
| Manutenção | Cerca, bebedouro, equipamentos |
| Combustível | Óleo diesel, gasolina |
| Veterinário | Honorários |
| Outros | Demais despesas |

### Registrando um Custo

1. Clique em **Custos** → **Novo Custo**
2. Preencha: categoria, descrição, data, vencimento, valor
3. Associe a uma fazenda ou lote específico (opcional)

### Pagando um Custo

1. Localize o custo na lista
2. Clique no botão **Pagar**
3. O sistema registra a data de pagamento automaticamente

### Status do Custo

| Status | Descrição |
|---|---|
| **Em Aberto** | Não pago, dentro do prazo |
| **Vencido** | Não pago, prazo expirado — aparece nos Alertas |
| **Pago** | Quitado |
| **Cancelado** | Anulado |

---

## Manejo Sanitário

Registre toda a saúde do rebanho: vacinas, vermífugos, medicamentos e diagnósticos.

### Tipos de Evento Sanitário

| Tipo | Quando usar |
|---|---|
| **Vacina** | Imunizações obrigatórias e eletivas |
| **Vermífugo** | Controle de endoparasitas |
| **Medicamento** | Tratamentos curativos |
| **Doença** | Diagnóstico de enfermidade |
| **Morte** | Registro de óbito |
| **Outro** | Castração, descorna, etc. |

### Registrando um Evento

1. Clique em **Manejo Sanitário** → **Novo Evento**
2. Selecione o animal
3. Preencha: tipo, data, produto, dosagem, responsável
4. Informe o **período de carência** (dias) — o sistema calculará a data de liberação para abate

---

## Financeiro

A tela **Financeiro** consolida a visão financeira da operação:

- **Receitas**: total de vendas no período
- **Despesas**: total de custos pagos no período
- **Resultado**: receitas − despesas
- **A Receber**: vendas com pagamento futuro
- **A Pagar**: custos em aberto com vencimento futuro

Use os filtros de período para analisar meses ou anos específicos.

---

## Relatórios e Exportação

### Tipos de Relatório

Acesse em **Relatórios** no menu lateral:

| Relatório | Dados incluídos |
|---|---|
| **Animais** | Identificação, raça, sexo, lote, peso atual |
| **Custos** | Categoria, descrição, valor, status, vencimento |
| **Pesagens** | Animal/lote, data, peso, GMD |

### Exportar CSV

Clique em **Exportar CSV** ao lado do relatório desejado. O arquivo pode ser aberto no Excel ou Google Sheets.

### Imprimir PDF

Clique em **Imprimir / PDF**. Uma página formatada para impressão será aberta. Use **Ctrl+P** (ou Cmd+P no Mac) e selecione **"Salvar como PDF"** na caixa de diálogo.

---

## Importação de Dados (CSV)

Importe dados em massa a partir de planilhas no formato CSV.

### Como Importar

1. Clique em **Importar** no menu lateral
2. Selecione o tipo de dados (Animais, Pesagens, etc.)
3. Faça download do **modelo CSV** para ver o formato correto
4. Preencha o modelo com seus dados
5. Faça upload do arquivo preenchido
6. Revise o preview e confirme a importação

### Regras do CSV

- Use ponto-e-vírgula (`;`) como separador
- Datas no formato `DD/MM/AAAA`
- Valores monetários sem R$ e com ponto como separador decimal (ex: `1500.00`)
- A primeira linha deve ser o cabeçalho (não altere os nomes das colunas)

---

## Alertas

O sino no canto superior direito da tela mostra alertas automáticos gerados pelo sistema. Os alertas são categorizados por gravidade:

| Cor | Gravidade | Exemplos |
|---|---|---|
| Vermelho | Crítico | Animal sem pesagem há 30+ dias |
| Amarelo | Atenção | Custo vencido há mais de 7 dias |
| Azul | Informativo | Animal próximo ao peso de abate |

Clique em um alerta para acessar diretamente o registro relacionado.

---

## Projeções Financeiras

Na página de detalhes de um **Lote**, o card de **Projeção Financeira** mostra estimativas ajustáveis em tempo real.

### Parâmetros Ajustáveis

| Parâmetro | Descrição |
|---|---|
| **Peso-alvo de abate** | Peso final desejado por animal (kg) |
| **Preço por arroba** | Cotação atual do mercado (R$/@) |
| **GMD esperado** | Ganho médio diário estimado (kg/dia) |

### Indicadores Projetados

| Indicador | Cálculo |
|---|---|
| **Dias para abate** | (peso-alvo − peso atual) ÷ GMD |
| **Data estimada** | Hoje + dias para abate |
| **Arrobas projetadas** | (peso-alvo ÷ 15) × quantidade |
| **Receita projetada** | arrobas × preço/@ |
| **Lucro projetado** | receita − custos acumulados |
| **Lucro por cabeça** | lucro ÷ quantidade |
| **Lucro por arroba** | lucro ÷ arrobas projetadas |

> Ajuste os parâmetros para simular diferentes cenários de mercado.

---

## Configurações e Usuários

Acesse **Configurações** no menu lateral (requer permissão de gestor ou superior).

### Convidar Usuários

1. Vá em **Configurações → Usuários**
2. Clique em **Convidar Usuário**
3. Informe o e-mail e selecione o perfil de acesso

O usuário receberá um convite e poderá criar sua conta.

### Alterar Perfil de um Usuário

1. Localize o usuário na lista
2. Clique em **Editar**
3. Selecione o novo perfil e salve

### Remover Usuário

1. Localize o usuário na lista
2. Clique em **Remover**
3. O usuário perde o acesso imediatamente, mas seus registros são mantidos

---

## Perfis de Acesso

Cada usuário tem um **perfil (role)** que define o que pode ver e fazer no sistema.

| Perfil | O que pode fazer |
|---|---|
| **Proprietário** | Acesso total, incluindo gerenciar a assinatura |
| **Administrador** | Acesso total, exceto gerenciar assinatura |
| **Gerente** | Gerencia toda a operação: lotes, animais, compras, vendas e custos |
| **Financeiro** | Acessa e gerencia compras, vendas e custos; não acessa saúde animal |
| **Veterinário** | Registra pesagens e eventos sanitários; não acessa financeiro |
| **Operador** | Registra pesagens e eventos sanitários no campo |
| **Visualizador** | Visualiza tudo, não edita nada |
| **Membro** | Visualiza apenas fazendas, lotes e animais básicos |

> Apenas **Proprietário** e **Administrador** podem convidar usuários e alterar perfis.

---

## Perguntas Frequentes

**Como calcular o GMD?**
O GMD (Ganho Médio Diário) é calculado automaticamente a cada pesagem: GMD = (peso atual − peso anterior) ÷ dias entre pesagens.

**O que é arroba?**
Arroba é a unidade de medida do mercado pecuário brasileiro. 1 arroba = 15 kg. O preço dos bois é cotado em R$/@ (reais por arroba).

**Posso usar o sistema em vários dispositivos?**
Sim. O Peccor funciona no navegador de qualquer dispositivo — computador, tablet ou celular.

**Como sei quando um animal está pronto para o abate?**
Use as **Projeções Financeiras** na página do lote. O sistema calcula automaticamente a data estimada de abate com base no peso atual, GMD e peso-alvo configurado.

**Perdi um dado, consigo recuperar?**
Os dados não são excluídos permanentemente ao fechar lotes ou registrar vendas. Entre em contato com o suporte se precisar de assistência.

**Posso exportar meus dados?**
Sim. Acesse **Relatórios** e exporte qualquer módulo em CSV (compatível com Excel) ou imprima em PDF.

**Como funciona o período de carência sanitária?**
Ao registrar um evento sanitário com período de carência (ex: 21 dias), o sistema calcula automaticamente a data em que o animal pode ser abatido com segurança.

**Esqueci minha senha, o que faço?**
Na tela de login, clique em **"Esqueci minha senha"** e informe seu e-mail. Você receberá instruções para redefinir a senha.
