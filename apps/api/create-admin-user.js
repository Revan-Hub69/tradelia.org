const { createClient } = require('@supabase/supabase-js')

// Imposta direttamente le credenziali Supabase
const supabaseUrl = 'https://higkhlfjfhlecbtfnznx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ1Nzk5OSwiZXhwIjoyMDc4MDMzOTk5fQ.iOqVIFi-WxChkTNkc58fizixSfRcANohcG1A9ggtkjs'

// Crea il client con il service role key (bypassa RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...')

    const adminEmail = 'amministrazione@tradelia.org'
    const adminPassword = 'Admin123!@#' // Password temporanea - da cambiare

    // Crea l'utente con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Salta la conferma email per l'admin
      user_metadata: {
        role: 'admin',
        created_by: 'system'
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('⚠️  IMPORTANTE: Cambia questa password dopo il primo login!')

    // Verifica che l'utente sia nella whitelist
    const { data: whitelistData, error: whitelistError } = await supabase
      .from('admin_whitelist')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (whitelistError || !whitelistData) {
      console.error('❌ Admin user not found in whitelist!')
      return
    }

    console.log('✅ Admin user verified in whitelist')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Esegui lo script
createAdminUser()
