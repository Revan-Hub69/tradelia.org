import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-static'
export const revalidate = 300

export async function GET() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tradelia Test</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Tradelia - Test Page</h1>
        <p>Se vedi questa pagina, il server funziona!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Environment: ${process.env.NODE_ENV}</p>
        <p>Working Directory: ${process.cwd()}</p>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}