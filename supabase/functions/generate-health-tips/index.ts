import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em saúde ocupacional e bem-estar no trabalho. Gere dicas de saúde atualizadas e relevantes para pessoas que trabalham em escritório ou home office. 
            
Use a data de hoje (${today}) como referência para incluir dicas sazonais quando apropriado.

IMPORTANTE: Responda APENAS com um JSON válido, sem markdown, sem código, apenas o JSON puro.`
          },
          {
            role: 'user',
            content: `Gere 5 dicas de saúde únicas e atualizadas para hoje (${today}). 

Inclua dicas sobre:
- Saúde ocular
- Postura e ergonomia
- Hidratação
- Pausas e movimentação
- Saúde mental e produtividade

Responda APENAS com este formato JSON exato:
{
  "tips": [
    {
      "id": "1",
      "iconType": "eye",
      "title": "Título da dica",
      "description": "Descrição detalhada da dica com 2-3 frases."
    }
  ],
  "generatedAt": "${today}"
}

Valores válidos para iconType: "eye", "clock", "book", "tree", "coffee", "sun", "heart", "activity", "droplet", "brain"`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let tips;
    try {
      // Remove any potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      tips = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify(tips), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error generating tips:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        tips: null 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
