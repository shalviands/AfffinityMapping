import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { buildClusteringPrompt, ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch session context
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('research_question, sector, stage')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch CONFIRMED cards (post-review)
    const { data: cards, error: cardsError } = await supabase
      .from('confirmed_cards')
      .select('*')
      .eq('session_id', sessionId)
      .eq('reviewed', true);

    if (cardsError || !cards || cards.length === 0) {
      return NextResponse.json({ error: 'No confirmed cards found for clustering' }, { status: 400 });
    }

    // Call AI for clustering
    const userPrompt = buildClusteringPrompt(
      cards,
      (session as any).research_question,
      (session as any).sector,
      (session as any).stage
    );

    const { data: result, modelUsed } = await callAI({
      systemPrompt: ANALYSIS_SYSTEM_PROMPT,
      userPrompt,
      jsonMode: true,
      maxTokens: 4000,
    });

    // Store clustered board state
    const boardData = {
      session_id: sessionId,
      clusters: result.clusters,
      version: 1,
      last_edited_at: new Date().toISOString()
    };

    const { error: upsertError } = await (supabase.from('boards') as any)
      .upsert(boardData as any, { onConflict: 'session_id' });

    if (upsertError) {
      console.error('Upsert board error:', upsertError);
    }

    return NextResponse.json({ 
      clusters: result.clusters, 
      unclustered: result.unclustered, 
      modelUsed 
    });
  } catch (error: any) {
    console.error('Clustering API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
