import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { buildSynthesisPrompt, ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, clusterName, cards } = await req.json();

    if (!sessionId || !clusterName || !cards) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch session context
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('research_question, sector, stage, round_number')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Call AI for synthesis
    const userPrompt = buildSynthesisPrompt(
      clusterName,
      cards,
      (session as any).research_question,
      (session as any).sector,
      (session as any).stage,
      (session as any).round_number || 1,
      10 // Default total sessions context
    );

    const { data: synthesis, modelUsed } = await callAI({
      systemPrompt: ANALYSIS_SYSTEM_PROMPT,
      userPrompt,
      jsonMode: false,
      maxTokens: 1000,
    });

    return NextResponse.json({ synthesis, modelUsed });
  } catch (error: any) {
    console.error('Synthesis API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
