import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";


import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

import fastify from "fastify";
import { createClientRoute } from "./http/controllers/client/create";
import { errorHandler } from "./error-handler";
import { getClientByIdRoute } from "./http/controllers/client/get-by-id";
import { listClientsRoute } from "./http/controllers/client/list";
import { updateClientRoute } from "./http/controllers/client/update-profile";
import { deleteClientRoute } from "./http/controllers/client/delete";
import { authenticateRoute } from "./http/controllers/auth/authenticate";
import { addCreditRoute } from "./http/controllers/client/add-credit";
import { getBalanceRoute } from "./http/controllers/client/get-balance";
import { createConversationRoute } from "./http/controllers/conversation/create";
import { listConversationsRoute } from "./http/controllers/conversation/list";
import { getConversationByIdRoute } from "./http/controllers/conversation/get-by-id";
import { sendMessageRoute } from "./http/controllers/message/send-message";
import { listConversationMessagesRoute } from "./http/controllers/message/list-conversation-messages";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Big Chat Brasil",
      version: "0.1",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(createClientRoute)
app.register(getClientByIdRoute)
app.register(listClientsRoute)
app.register(updateClientRoute)
app.register(deleteClientRoute)
app.register(addCreditRoute)
app.register(getBalanceRoute)

app.register(createConversationRoute)
app.register(listConversationsRoute)
app.register(getConversationByIdRoute)

app.register(sendMessageRoute)
app.register(listConversationMessagesRoute)

app.register(authenticateRoute)

app.setErrorHandler(errorHandler)