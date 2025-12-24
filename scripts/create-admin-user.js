const { createClient } = require('@supabase/supabase-js')

// Usa le credenziali del service role per creare l'utente admin
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables')
  process.exit(1)
}

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
