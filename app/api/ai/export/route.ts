import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { buildJTBDPrompt, buildLeanCanvasPrompt, ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, type, clusters } = await req.json();

    if (!sessionId || !type || !clusters) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = createClient();

    // Fetch session context
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('sector, stage')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    let result;
    if (type === 'jtbd') {
      const prompt = buildJTBDPrompt(clusters, session.sector);
      const aiRes = await callAI({
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        userPrompt: prompt,
        jsonMode: true,
      });
      result = aiRes.data;
    } else if (type === 'leancanvas') {
      const prompt = buildLeanCanvasPrompt(clusters, session.sector, session.stage);
      const aiRes = await callAI({
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        userPrompt: prompt,
        jsonMode: true,
      });
      result = aiRes.data;
    } else {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
