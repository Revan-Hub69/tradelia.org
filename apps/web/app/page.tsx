export default function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Tradelia - Homepage Test</h1>
      <p>Se vedi questa pagina, Next.js funziona!</p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Debug Info:</h2>
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>Build: Static rendering test</p>
      </div>
    </div>
  )
}