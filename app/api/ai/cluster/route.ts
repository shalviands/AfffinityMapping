import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { buildClusteringPrompt, ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, projectId } = await req.json();

    if (!sessionId && !projectId) {
      return NextResponse.json({ error: 'Session ID or Project ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    let contextData: any = null;
    let cardsData: any[] = [];

    if (projectId) {
      // Fetch project context
      const { data: project, error: pError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (pError || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      contextData = {
        research_question: 'Aggregate analysis of multiple stakeholders',
        sector: (project as any).sector,
        stage: 'Synthesis'
      };

      // Fetch all confirmed cards for all sessions in this project
      const { data: sessions } = await supabase.from('sessions').select('id').eq('project_id', projectId);
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => (s as any).id);
        const { data: cards } = await supabase
          .from('confirmed_cards')
          .select('*')
          .in('session_id', sessionIds)
          .eq('reviewed', true);
        cardsData = cards || [];
      }
    } else {
      // Fetch session context
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('research_question, sector, stage')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      contextData = session;

      // Fetch cards for this session
      const { data: cards } = await supabase
        .from('confirmed_cards')
        .select('*')
        .eq('session_id', sessionId)
        .eq('reviewed', true);
      cardsData = cards || [];
    }

    if (cardsData.length === 0) {
      return NextResponse.json({ error: 'No confirmed cards found for clustering' }, { status: 400 });
    }

    // Call AI for clustering
    const userPrompt = buildClusteringPrompt(
      cardsData,
      contextData.research_question,
      contextData.sector,
      contextData.stage
    );

    const { data: result, modelUsed } = await callAI({
      systemPrompt: ANALYSIS_SYSTEM_PROMPT,
      userPrompt,
      jsonMode: true,
      maxTokens: 4000,
    });

    // Store clustered board state
    const boardData: any = {
      clusters: result.clusters,
      version: 1,
      last_edited_at: new Date().toISOString()
    };
    
    if (projectId) boardData.project_id = projectId;
    else boardData.session_id = sessionId;

    const { error: upsertError } = await (supabase.from('boards') as any)
      .upsert(boardData, { onConflict: projectId ? 'project_id' : 'session_id' });

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
