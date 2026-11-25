# 🐾 PETSOS

O **PETSOS** é um protótipo web de um assistente de primeiros socorros para pets. Seu objetivo é demonstrar como um sistema de triagem de sintomas pode auxiliar tutores na identificação do nível de urgência de um atendimento veterinário.

O projeto foi desenvolvido para a disciplina de **Tópicos Avançados em Negócios Digitais**, como um MVP acadêmico, com foco na simplicidade, usabilidade e responsividade.

## Funcionalidades

- Cadastro de tutores e login simulado, sem validação de credenciais no acesso.
- Cadastro, consulta, edição e exclusão de pets.
- Triagem de sintomas por palavras-chave.
- Classificação dos sintomas em três níveis de urgência.
- Sugestão de clínica parceira fictícia em casos de urgência.
- Histórico de triagens por pet, com filtros e exclusão de registros.
- Avaliação das orientações com notas de 1 a 5 estrelas e comentários.
- Armazenamento local dos dados no navegador.
- Interface responsiva com abordagem mobile-first.

## Classificação da triagem

| Classificação | Orientação simulada |
| --- | --- |
| 🔴 Urgência | Buscar atendimento veterinário presencial imediato. |
| 🟡 Pode esperar | Observar o pet e procurar orientação veterinária. |
| 🟢 Cuidado em casa | Apresentar orientações gerais de cuidado. |

A classificação utiliza regras predefinidas em JavaScript, sem integração com inteligência artificial. Quando o relato é insuficiente ou não corresponde às regras, o sistema solicita mais detalhes.

## Tecnologias utilizadas

- **HTML5** — estrutura da aplicação.
- **CSS3** — estilização e responsividade.
- **JavaScript (Vanilla JS)** — regras de negócio, navegação e manipulação dos dados.
- **LocalStorage** — persistência dos dados no navegador.

## Estrutura do projeto

```text
PETSOS/
├── index.html    # Estrutura da aplicação
├── style.css     # Estilos e responsividade
├── app.js        # Lógica e funcionalidades
└── README.md     # Documentação do projeto
```

## Como executar

1. Baixe ou clone este repositório.
2. Abra a pasta do projeto.
3. Abra o arquivo `index.html` em um navegador.
4. Clique em **Entrar** para acessar a aplicação ou em **Criar conta** para cadastrar um tutor.
5. Cadastre um pet e inicie uma nova triagem.

Não é necessário instalar dependências, configurar um banco de dados ou iniciar um servidor. Utilize apenas informações fictícias: o login é simulado e os dados locais não possuem segurança de produção.

## Casos de teste

Os cenários abaixo foram definidos para verificar as principais funcionalidades do MVP.

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| CT01 | Meu cachorro está vomitando muito e apático | Urgência |
| CT02 | Meu gato espirrou algumas vezes hoje | Pode esperar |
| CT03 | Meu cachorro está com uma pulga | Cuidado em casa |
| CT04 | Enviar sintomas sem preencher a descrição | Bloqueio do envio |
| CT05 | Cadastrar um tutor com e-mail já existente | Cadastro recusado |
| CT06 | Realizar uma triagem de urgência | Sugestão de clínica fictícia |
| CT07 | Consultar o histórico de triagens | Registros ordenados da data mais recente à mais antiga |

## Escopo e limitações

Esta versão é um MVP exclusivamente front-end. Não possui backend, banco de dados externo, autenticação real, geolocalização, notificações ou integração com clínicas reais. Os dados ficam armazenados no navegador utilizado.

> **Aviso:** o PETSOS orienta, mas não substitui o diagnóstico veterinário e não prescreve medicação. Este protótipo acadêmico não possui validação veterinária e não deve ser usado para decidir se um atendimento real pode esperar. Em caso de emergência, procure atendimento veterinário imediatamente.

## Equipe

- Gabriel Venerusso
- Guilherme Miranda
- Larissa Bertling
- Matheus Campos
- Nicoly Ott
