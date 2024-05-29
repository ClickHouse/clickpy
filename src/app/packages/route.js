import { NextResponse } from 'next/server'
import { getPackages } from '@/utils/clickhouse'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.has('query') ? searchParams.get('query') : ''
  const [_, res] = await getPackages(query)
  return NextResponse.json({
    query: query,
    response: res
  })
}
