import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Only use dotenv in local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config({ path: join(__dirname, '..', '.env') });
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- Supabase Setup ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Anon key
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// Request logging for debugging Vercel
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
// --- Serve Frontend Static Files (Local development only) ---
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const distPath = join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}
// --- Groq API Setup ---
const groq = new Groq({
  apiKey: process.env.GEMINI_API_KEY?.trim(),
});

const JSON_SCHEMA = {
  meal_type: "tipo de refeição",
  items: [
    {
      name: "nome",
      quantity: "quantidade",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      saturated_fat: 0,
      sodium: 0
    }
  ],
  source_info: "fonte da informação (ex: Tabela Nutricional Continente, Estimativa IA, etc.)"
};

const SYSTEM_PROMPT = `És um nutricionista especialista em produtos alimentares do mercado português, com foco em precisão absoluta.
Analisa a descrição da refeição e devolve os valores nutricionais em formato JSON.

REGRAS DE OURO DE PRECISÃO:
1. FONTE MESTRA: Deves utilizar OBRIGATORIAMENTE os valores exatos do www.fatsecret.pt (Portugal).
2. URL DA FONTE: No campo "source_info", deves fornecer o URL completo e exato do produto no FatSecret. 
3. PORÇÕES REAIS: Presta atenção máxima à porção (ex: se o FatSecret diz "1 dose (127g)", utiliza esses valores exatos de 142 kcal, 14.1g Proteína, etc., para esse produto específico). Não inventes porções de 40g ou 100g se o padrão do produto for outro.
4. MARCAS PT: Conheces profundamente o mercado português (Continente, Pingo Doce, Nestlé PT, Prozis).
5. FIDELIDADE: Se o utilizador escrever um produto, assume que ele se refere à versão mais comum encontrada no FatSecret.pt.

Responde APENAS com o objeto JSON seguindo esta estrutura:
${JSON.stringify(JSON_SCHEMA, null, 2)}

Não adiciones texto fora do JSON.`;

// --- Middleware: Auth (Verify Supabase JWT) ---
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autenticado' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida' });
  }

  req.userId = user.id;
  req.token = token; // Store token for scoped DB calls
  next();
};

// --- Helper: Scoped Supabase Client ---
const getScopedClient = (token) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
};

// --- Routes: Auth ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ token: data.session?.access_token, user: data.user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: 'Credenciais inválidas' });
  
  // Get profile to see if onboarding is done
  const { data: profile } = await getScopedClient(data.session.access_token)
    .from('profiles')
    .select('*')
    .single();

  res.json({ 
    token: data.session.access_token, 
    user: { ...data.user, profile } 
  });
});

// --- Routes: Profile ---
app.post('/api/user/profile', authenticate, async (req, res) => {
  const { gender, age, height, weight, goal, activity_level } = req.body;
  
  // Calculate TDEE (Mifflin-St Jeor)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === 'masculino' ? bmr + 5 : bmr - 161;

  const activityMultipliers = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    ativo: 1.725,
    atleta: 1.9
  };

  const tdee = bmr * (activityMultipliers[activity_level] || 1.2);
  let targetCalories = tdee;
  if (goal === 'perder') targetCalories -= 500;
  if (goal === 'ganhar') targetCalories += 400;

  const targets = {
    calories: Math.round(targetCalories),
    protein: Math.round(weight * 1.8),
    carbs: Math.round((targetCalories * 0.45) / 4),
    fat: Math.round((targetCalories * 0.25) / 9)
  };

  const profileData = {
    id: req.userId,
    gender, age, height, weight, goal, activity_level,
    targets
  };

  const { data, error } = await getScopedClient(req.token)
    .from('profiles')
    .upsert(profileData)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/user/me', authenticate, async (req, res) => {
  const { data: profile } = await getScopedClient(req.token)
    .from('profiles')
    .select('*')
    .single();
    
  res.json({ id: req.userId, profile });
});

// --- Routes: Meals ---
app.get('/api/meals/:date', authenticate, async (req, res) => {
  const { date } = req.params;
  const { data, error } = await getScopedClient(req.token)
    .from('meals')
    .select('*')
    .eq('date', date);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/meals', authenticate, async (req, res) => {
  const { meal_type, items, date, original_text, source_info } = req.body;
  
  const { data, error } = await getScopedClient(req.token)
    .from('meals')
    .insert([{
      user_id: req.userId,
      meal_type,
      items,
      date,
      original_text,
      source_info: source_info || null
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/meals/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { error } = await getScopedClient(req.token)
    .from('meals')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Groq Rate Limit Protection ---
// Per-user cooldown map: userId -> timestamp of last request
const lastRequestTime = new Map();
const USER_COOLDOWN_MS = 5000; // 5 seconds between requests per user

/**
 * Calls Groq with exponential backoff + jitter on 429 errors.
 * Reads Retry-After header when available (Groq always sends it).
 */
async function callGroqWithRetry(payload, attempt = 0) {
  const MAX_RETRIES = 3;
  try {
    return await groq.chat.completions.create(payload);
  } catch (error) {
    const is429 = error?.status === 429 || error?.message?.includes('429');
    if (is429 && attempt < MAX_RETRIES) {
      // Read Retry-After from Groq headers (in seconds), fallback to exponential backoff
      const retryAfterSec = error?.headers?.get?.('retry-after');
      const baseWait = retryAfterSec
        ? parseInt(retryAfterSec) * 1000
        : Math.pow(2, attempt) * 1000;
      const jitter = Math.random() * 500; // up to 500ms jitter
      const waitMs = baseWait + jitter;

      console.warn(`⚠️  Groq 429 — aguardando ${Math.round(waitMs)}ms antes do retry ${attempt + 1}/${MAX_RETRIES}`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return callGroqWithRetry(payload, attempt + 1);
    }
    throw error;
  }
}


app.post('/api/analyze', authenticate, async (req, res) => {
  // Per-user cooldown check
  const now = Date.now();
  const lastReq = lastRequestTime.get(req.userId) || 0;
  const timeSinceLast = now - lastReq;

  if (timeSinceLast < USER_COOLDOWN_MS) {
    const waitSec = Math.ceil((USER_COOLDOWN_MS - timeSinceLast) / 1000);
    return res.status(429).json({
      error: `Aguarda ${waitSec}s antes de analisar outra refeição.`,
      retryAfter: waitSec
    });
  }
  lastRequestTime.set(req.userId, now);

  try {
    const { text } = req.body;
    const completion = await callGroqWithRetry({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: text }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error('Erro na análise Groq:', error);
    const is429 = error?.status === 429 || error?.message?.includes('429');
    if (is429) {
      return res.status(429).json({
        error: 'Limite da API da IA atingido (Rate Limit). Aguarda 1 minuto e tenta novamente.',
        retryAfter: 60
      });
    }
    res.status(500).json({ error: 'Erro na análise: ' + error.message });
  }
});

// Route fallback for local development is already handled above

// Only listen if not in Vercel environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 NutriTrack Server a correr na porta ${PORT}`));
}

export default app;
