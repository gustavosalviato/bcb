## Comparações

### Síncrono

- Preciso obter algo de resposta rápida
- Preciso cadastrar uma informação que vai ser utilizada depois (cadastros hierárquicos)
- Preciso alterara uma informação (status, preço) 

### Assíncrono

- O que eu preciso obter demora tanto, que talvez o request dê timeout
- Preciso cadastrar uma informação que não é hierárquica
- Preciso alterar uma informação (status, preço)


## Vantagens Síncrono

- Muito mais simples (Resposta succeso ou falha)
- Garantia de processamento ao receber um resposta

## Vantagens Assíncrono
- Split de trabalho
- Operações Long-Running  


### Broker
 - Mensagens disponíveis para serem consumidadas da fila

### DLQ
- Fila de mensagens mortas


### RabbitMQ
- Serviço de mensageria
- Publisher / Subscriber

