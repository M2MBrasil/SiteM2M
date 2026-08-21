import { NextRequest, NextResponse } from 'next/server';
import { getInitialDatabase } from '@/lib/storage';

// In-memory persistent state on server
let serverDatabase = getInitialDatabase();

export async function GET() {
  return NextResponse.json({ success: true, data: serverDatabase });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body && typeof body === 'object') {
      serverDatabase = {
        ...serverDatabase,
        ...body,
      };
      return NextResponse.json({ success: true, message: 'Dados sincronizados com sucesso' });
    }
    return NextResponse.json({ success: false, error: 'Corpo da requisição inválido' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro interno ao processar sincronização' }, { status: 500 });
  }
}
