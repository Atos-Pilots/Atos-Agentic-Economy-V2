import { app } from './gateway/gateway_v2';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server] Atos Agentic Economy Pilot V2 listening on port ${PORT}`);
});
