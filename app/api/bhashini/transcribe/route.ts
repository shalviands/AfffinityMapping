import { NextRequest, NextResponse } from 'next/server';
import { transcribeWithBhashini } from '@/lib/bhashini/transcribe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    const language = (formData.get('language') as string) || 'hi';

    if (!audioFile || !sessionId) {
      return NextResponse.json({ error: 'Audio file and Session ID are required' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // 1. Transcribe
    const { transcript, engine, error } = await transcribeWithBhashini(buffer, language);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    // 2. Store transcript in DB
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from('transcripts')
      .insert({
        session_id: sessionId,
        transcript_text: transcript,
        source: 'file_upload',
        processing_engine: engine,
        language
      });

    if (dbError) {
      console.error('Database error storing transcript:', dbError);
    }

    return NextResponse.json({ transcript, engine });
  } catch (error: any) {
    console.error('Bhashini Transcribe API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
