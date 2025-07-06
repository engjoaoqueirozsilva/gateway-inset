export const checkApiKey = (req, res, next) => {
  if (req.method === 'OPTIONS') { // ESSENCIAL para CORS e Preflight
    return next();
  }
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== '0c4d8a7a-bde6-4e3a-a2ef-5cde95727e2e') { // Usando a chave hardcoded para comparação
    return res.status(401).json({ message: 'Acesso não autorizado: Chave de API inválida ou ausente.' });
  }
  next();
};