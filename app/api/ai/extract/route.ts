import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { buildExtractionPrompt, EXTRACTION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, transcript } = await req.json();

    if (!sessionId || !transcript) {
      return NextResponse.json({ error: 'Session ID and transcript are required' }, { status: 400 });
    }

    // Fetch session context from Supabase
    const supabase = await createClient();
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('research_question, sector, stage')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Session fetch error:', sessionError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Call AI for extraction
    const userPrompt = buildExtractionPrompt(
      transcript,
      (session as any).research_question,
      (session as any).sector,
      (session as any).stage
    );

    const { data, modelUsed } = await callAI({
      systemPrompt: EXTRACTION_SYSTEM_PROMPT,
      userPrompt,
      jsonMode: true,
      maxTokens: 4000,
    });

    const cards = data.cards || data;

    // Store extracted cards in database
    const cardsToInsert = cards.map((card: any) => ({
      session_id: sessionId,
      card_id: card.id,
      insight: card.insight,
      quote: card.quote,
      speaker: card.speaker || 'unknown',
      timestamp: card.timestamp || 'unknown',
      sentiment: card.sentiment,
      confidence: card.confidence,
      assertive: card.assertive || false,
      theme: card.theme || null,
    }));

    const { error: insertError } = await (supabase.from('extracted_cards') as any).insert(cardsToInsert as any);
    
    if (insertError) {
      console.error('Insert cards error:', insertError);
    }

    return NextResponse.json({ cards, modelUsed });
  } catch (error: any) {
    console.error('Extraction API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
